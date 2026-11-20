import {preparePredictionReasoning} from './core/reasoning-policy.mjs';
import {BalanceWatchdog} from './core/balance-watchdog.mjs';
import {balanceRoute,queryDeepSeekBalance} from './core/deepseek-balance.mjs';
import {ContextEvents} from './core/context-events.mjs';
import {PredictionBlacklist} from './core/blacklist.mjs';
import {EventCoordinator} from './core/event-coordinator.mjs';
import {SessionLifecycle,ResultCache,LIFECYCLE_DEFAULTS,LIFECYCLE_KEYS,validateLifecycle} from './core/lifecycle.mjs';
import {fingerprint} from './core/context-mapping.mjs';
import {ThreadAccounting,publicQuote} from './core/thread-accounting.mjs';
import flashProfile from '../examples/profiles/deepseek-flash.json' with {type:'json'};
import proProfile from '../examples/profiles/deepseek-v4-pro.json' with {type:'json'};

import z from '../lib/schema.mjs';
import { mkdir, readFile, writeFile, rename, appendFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import {readFileSync,lstatSync,realpathSync,watch} from 'node:fs';
import {relative,isAbsolute} from 'node:path';
import {POLICY_DEFAULTS,POLICY_KEYS,validatePolicy,instructionDigest} from './core/policy.mjs';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { ProfileManager } from './core/profiles.mjs';
import { UsageLedger, quotePrice } from './core/billing.mjs';
import { CostGate } from './core/budget.mjs';
import { createDSHProjection,createDSHHooks } from './core/dsh-projection.mjs';
import { InstanceLease } from './core/ownership.mjs';
import { PredictionEngine, DEFAULT_PROMPT } from './core/engine.mjs';
import { runTransport, collectDSHStream } from './core/transports.mjs';
import { mountRpc } from './client/host-rpc.mjs';
export const name='composer-prediction';
export const inject=['llm','sessions','agents','connection','webServer'];
export const Config=z.object({
 directory:z.string().default(join(process.env.DSH_HOME??join(homedir(),'.dsh'),'plugins-data','composer-prediction')),
 enabled:z.boolean().default(true),
 ...Object.fromEntries(LIFECYCLE_KEYS.map(k=>[k,(typeof LIFECYCLE_DEFAULTS[k]==='boolean'?z.boolean():z.number()).default(LIFECYCLE_DEFAULTS[k])])),
 budgetLimits:z.object({CNY:z.number().min(0),USD:z.number().min(0)}).default({}),
 profileFile:z.string().default('parent'),
 timeoutMs:z.number().min(1).max(30000).step(1).default(30000),
 liveSampleRate:z.number().min(0).max(1).default(1),
 catchUpSampleRate:z.number().min(0).max(1).default(1),
 ...Object.fromEntries(POLICY_KEYS.map(k=>[k,(typeof POLICY_DEFAULTS[k]==='boolean'?z.boolean():typeof POLICY_DEFAULTS[k]==='number'?z.number():z.string()).default(POLICY_DEFAULTS[k])])),
 prompt:z.string().default(DEFAULT_PROMPT),
 promptVersion:z.string().default('dsh-local-boundaries-v2')
});
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const detached=x=>JSON.parse(JSON.stringify(x));
export async function createController(ctx,config){
 const directory=resolve(config.directory),profilesDirectory=join(directory,'profiles');
 await mkdir(profilesDirectory,{recursive:true,mode:0o700});
 const lease=new InstanceLease(join(directory,'owner.sqlite'));
 let ledger,accounting,resultCache,balanceWatchdog;
 try {
 ledger=new UsageLedger({path:join(directory,'usage.sqlite')});
 await ledger.recoverPending({finishedAt:new Date().toISOString()});
 const initialProfiles=await import('node:fs/promises').then(fs=>fs.readdir(profilesDirectory));
 if(!initialProfiles.some(name=>name.endsWith('.json'))){
  for(const profile of [flashProfile,proProfile]){
   try{await writeFile(join(profilesDirectory,profile.id+'.json'),JSON.stringify(profile,null,2),{flag:'wx',mode:0o600})}catch(error){if(error.code!=='EEXIST')throw error}
  }
 }
 const cutoffFile=join(directory,'accounting-start.json');
 let cutoff;try{cutoff=JSON.parse(await readFile(cutoffFile,'utf8')).time}catch(error){if(error.code!=='ENOENT')throw error;cutoff=Date.now();await writeFile(cutoffFile,JSON.stringify({time:cutoff}),{flag:'wx',mode:0o600})}
 let routePricebooks=[];
 accounting=new ThreadAccounting({path:join(directory,'main-usage.sqlite'),books:[flashProfile,proProfile],resolveBooks:()=>[flashProfile,proProfile,...routePricebooks],resolveOptions:options=>pricedRoute(options),cutoff,readSession:id=>{const query=ctx.get('sessionQuery');if(!query?.readSession)throw Error('History query unavailable');return query.readSession(id)}});
 await accounting.ledger.recoverPending({finishedAt:new Date().toISOString()});
 const makeManager=()=>new ProfileManager({directory:profilesDirectory,secretResolver:async ref=>(await ctx.get?.('credentials')?.resolve(ref))?.value});
 let selected='parent',manager=makeManager(),configurationQueue=Promise.resolve();
 const profiles={
  current:()=>selected==='parent'?null:manager.current(),
  publicCurrent:()=>selected==='parent'?{id:'parent',label:'父请求后端',protocol:'parent'}:manager.publicCurrent(),
  resolveCredential:profile=>manager.resolveCredential(profile)
 };
 const saved=await readFile(join(directory,'settings.json'),'utf8').then(JSON.parse).catch(e=>{if(e.code==='ENOENT')return {};throw e});
 const initial={...config,...saved};initial.minRetainedCacheRatio=Math.max(0.5,initial.minRetainedCacheRatio??0.5);
 if((saved.profileFile??config.profileFile)!=='parent'){await manager.select(saved.profileFile??config.profileFile);selected=saved.profileFile??config.profileFile}
 routePricebooks=(await manager.list()).filter(p=>p.mainRoute);
 const pricedRoute=options=>['deepseek','deepseek-official'].includes(options.provider)?{...options,baseURL:balanceRoute(ctx,profiles,null,{options}).origin}:options;
 const quoteParent=(options,at)=>publicQuote([flashProfile,proProfile,...routePricebooks],pricedRoute(options),at);
 const requests=new Map(),uiWaiters=new Map();let closed=false;
 const instructionPath=join(directory,'instruction_prediction.md');
 try{await writeFile(instructionPath,'<!-- 用户附加约束与 spec。优先级低于内置强制规则；此注释不发送给模型。 -->\n',{flag:'wx',mode:0o600})}catch(error){if(error.code!=='EEXIST')throw error}
 let instructionText='',instructionHash=instructionDigest(''),instructionError=null,instructionWatcher,instructionTimer;

 const gate=new CostGate({ledger,limitByCurrency:config.budgetLimits??null,scope:'global'});
 let lifecycle,coordinator,contextEvents;resultCache=new ResultCache(directory);
 balanceWatchdog=new BalanceWatchdog({path:join(directory,'balance-watchdog.json'),resolveRoute:(p,s)=>balanceRoute(ctx,profiles,p,s),probe:route=>queryDeepSeekBalance(route),enabled:()=>lifecycle?.config.balanceWatchdogEnabled!==false,activationFor:id=>lifecycle?.saved.threads[id]?.activation??null,epochFor:id=>lifecycle?.saved.threads[id]?.userEpoch??null,configKey:()=>fingerprint({selected,config:engine.config}),onEvent:(id,code,data)=>lifecycle?.notify(id,code,data),onResume:async(waiter,key)=>{
  await new Promise(resolve=>setImmediate(resolve));if(closed||waiter.configKey!==fingerprint({selected,config:engine.config})||!lifecycle.canSample(waiter.sessionId))return;
  if(!engine.config.automaticRetry){lifecycle.notify(waiter.sessionId,'balance-ready-manual-only',{});return;}
  const views=[...lifecycle.views.values()].filter(v=>v.sessionId===waiter.sessionId&&v.visible);if(views.length&&!views.some(v=>v.ready)){lifecycle.notify(waiter.sessionId,'balance-resume-skipped',{});return;}
  await prepareSession(waiter.sessionId);const state=refresh(waiter.sessionId,{force:true}),snapshot=engine.snapshots.get(waiter.sessionId),r=lifecycle.saved.threads[waiter.sessionId];
  if(closed||balanceWatchdog.closed||!state.eligible||!snapshot||snapshot.revision!==waiter.revision||(r?.userEpoch??null)!==waiter.userEpoch||r.awaitingAssistant||r.consumedRevision===waiter.revision||ctx.agents.get(waiter.sessionId)?.status==='running'||balanceWatchdog.route(profiles.current(),snapshot).key!==key){lifecycle.notify(waiter.sessionId,'balance-resume-skipped',{});return}
  if(waiter.originActivation==='retroactive'&&(!lifecycle.config.retroactiveEnabled||(r.lastUserSentAt??0)<Date.now()-lifecycle.config.retroactiveHours*3600000)){lifecycle.notify(waiter.sessionId,'balance-resume-skipped',{});return;}
  const cached=engine.peek(waiter.sessionId);if(cached?.status==='ready'||cached?.status==='abstained')return;
  if(cached&&!['QUOTA','BALANCE_PAUSED'].includes(cached.reason))return;
  engine.results.delete(waiter.sessionId);if(cached?.key)resultCache.delete(cached.key);r.balanceRecoveryGrant={revision:waiter.revision,userEpoch:waiter.userEpoch};lifecycle.persist();lifecycle.notify(waiter.sessionId,'balance-resuming',{});coordinator.enqueue(waiter.sessionId,'live');
 }});
 const engine=new PredictionEngine({prepareReasoning:args=>preparePredictionReasoning({...args,resolveModelInfo:(...a)=>ctx.llm.resolveModelInfo(...a)}),balanceWatchdog,enforceBilling:true,resultCache,validateSnapshot:s=>lifecycle?.snapshotCurrent(s)??true,validateSnapshotAsync:async s=>{await prepareSession(s.sessionId);return lifecycle?.snapshotCurrent(s)??true;},onEvent:(code,s,data)=>lifecycle?.notify(s.sessionId,code,{...data,sourceRevision:s.revision}),onAttempt:(s,u)=>lifecycle?.feedbackPrediction(s,u),profiles,ledger,costGate:gate,quoteForParent:(snapshot,at)=>quoteParent(snapshot.options,at),
  config:{...Object.fromEntries(POLICY_KEYS.filter(k=>initial[k]!==undefined).map(k=>[k,initial[k]])),enabled:initial.enabled,prompt:initial.prompt,promptVersion:initial.promptVersion,timeoutMs:initial.timeoutMs??config.timeoutMs??30000,liveSampleRate:initial.liveSampleRate??config.liveSampleRate??1,catchUpSampleRate:initial.catchUpSampleRate??config.catchUpSampleRate??1},
  run:async(profile,snapshot,prompt,options)=>{
   if(profile.protocol!=='deepseek-messages')return runTransport(profile,snapshot,prompt,options);
   const core=await import('../lib/dsh-native.mjs');
   return runTransport(profile,snapshot,prompt,{...options,projectDSHOptions:createDSHProjection(ctx,core),deepSeekHooks:createDSHHooks(ctx,core)});
  },
  parentRun:async(_profile,snapshot,prompt,{signal,onUsage,stage})=>{
   const options={...snapshot.options,messages:[...snapshot.options.messages,{role:'user',content:[{type:'text',text:prompt}]}],signal,purpose:stage==='repair'?'composer-prediction-repair':'composer-prediction'};
   return collectDSHStream(ctx.llm.stream(options),{signal,onUsage});
  },
  audit:async entry=>{
   const path=join(directory,'contexts');await mkdir(path,{recursive:true,mode:0o700});
   const contextId=hash(entry.request);
   try{await writeFile(join(path,contextId+'.json'),JSON.stringify(entry.request),{flag:'wx',mode:0o600})}catch(e){if(e.code!=='EEXIST')throw e}
   const {request,...metadata}=entry;
   await appendFile(join(directory,'samples.jsonl'),JSON.stringify({...metadata,contextId})+'\n',{mode:0o600});
  }
 });
 function syncInstructions(){
  try{
   const stat=lstatSync(instructionPath);const actual=realpathSync(instructionPath),base=realpathSync(directory),rel=relative(base,actual);
   if(!stat.isFile()||isAbsolute(rel)||rel==='..'||rel.startsWith('..'+(process.platform==='win32'?'\\':'/'))||stat.size>engine.config.instructionMaxBytes)throw Object.assign(Error('Invalid instruction file'),{code:'INSTRUCTION_FILE_LIMIT'});
   const raw=readFileSync(instructionPath);const text=new TextDecoder('utf-8',{fatal:true}).decode(raw).replace(/<!--[\s\S]*?-->/g,'').trim();
   const hash=instructionDigest(text);
   if(hash!==instructionHash){instructionHash=hash;instructionText=text;engine.changed();if(lifecycle)for(const id of lifecycle.records.keys())lifecycle.markDirty(id)}
   instructionError=null;return {fileName:'instruction_prediction.md',text:instructionText,digest:instructionHash,priority:'below-mandatory'};
  }catch(error){if(!instructionError)engine.changed();instructionError=error.code??'INSTRUCTION_READ';throw Object.assign(Error('Instruction file unavailable'),{code:instructionError})}
 }
 const blacklist=new PredictionBlacklist({directory,listWorkspaces:()=>{const registry=ctx.get('workspaceRegistry');if(!registry)throw Error('Workspace registry unavailable');return registry.list()}});
 const preparedSources=new Map();
 function readSnapshot(sessionId,preparedSession=null){
  syncInstructions();
  if(blacklist.evaluate(sessionId).blacklisted)return null;
  if(externalEditing.has(sessionId))return null;
  const live=ctx.sessions.get(sessionId),session=preparedSession??live,agent=ctx.agents.get(sessionId);
  if(!session)return preparedSources.get(sessionId)??null;
  if(!preparedSession&&!agent)return readSnapshot(sessionId,session);
  const header=session?.requestHeader();
  const options=header?{...header.config,tools:header.tools,toolHistory:session.toolHistory(),sessionId}:requests.get(sessionId);
  if(!session||!options||(!preparedSession&&!agent)||(agent&&agent.status!=='idle')||session.header?.origin==='subagent')return null;
  if((agent?.inbox?.nextTurn?.length??0)||(agent?.inbox?.nextStep?.length??0))return null;
  const plan=agent?ctx.get?.('planMode')?.get(agent):null;if(plan?.active||plan?.pending)return null;
  const boundary=ctx.agents.turnBoundaryOf(session);
  if(boundary.openTurnStartSeq!==null||boundary.lastTurn<1)return null;
  const events=session.snapshotEvents();
  const terminal=[...events].reverse().find(e=>e.type==='turn/end');
  if(!terminal||terminal.data?.reason?.kind!=='completed')return null;
  const finalStep=[...events].reverse().find(e=>e.type==='step/end');
  if(!finalStep||finalStep.data.turn!==terminal.data.turn||(finalStep.data.reason&&finalStep.data.reason.kind!=='stop'))return null;
  const finalAssistant=[...events].reverse().find(e=>e.type==='assistant/message');
  if(finalAssistant?.data?.turn!==terminal.data.turn)return null;
  const finish=[...events].reverse().find(e=>e.type==='assistant/message')?.data?.stream?.map(r=>r.chunk??r).findLast(c=>c.type==='finish');
  if(finish&&(typeof finish.reason==='string'?finish.reason:finish.reason?.kind)!=='stop')return null;
  if(hasPendingInbox(events))return null;
  const messages=session.deriveMessages();
  const last=[...messages].reverse().find(m=>m.role==='user'||m.role==='assistant');
  if(last?.role!=='assistant'||!last.content?.some(b=>b.type==='text'&&b.text?.trim()))return null;
  const aligned=lifecycle?.alignParent({...options,messages})??{...options,messages};
  const external=profiles.current();
  const projected=external?{...aligned,provider:external.id,model:external.model,
   ...Object.fromEntries(['reasoningEffort','maxTokens','temperature','stop'].filter(k=>external.request?.[k]!==undefined).map(k=>[k,external.request[k]]))}:aligned;
  const cacheRoute=external?fingerprint({id:external.id,protocol:external.protocol,baseURL:external.baseURL,model:external.model,accountId:external.accountId,request:external.request,cache:external.cache}):'parent';
  const revision=fingerprint({canonicalMessages:messages,options:projected,turn:boundary.lastTurn,instructionHash,cacheRoute,externalRevision:externalRevisions.get(sessionId)??0});
  return {sessionId,latestUserMessageId:[...messages].reverse().find(m=>m.role==='user'&&m.source?.kind==='user')?.id??null,instructionText,instructionDigest:instructionHash,contextWindow:session.requestContext()?.contextWindow,turnId:boundary.lastTurn,revision,eligible:true,cacheRoute,
   parentCacheReusable:selected==='parent',nativeSampling:external?.protocol==='codex-native',
   options:projected,parentConfig:{provider:options.provider,model:options.model,reasoningEffort:options.reasoningEffort,system:options.system,tools:options.tools,toolHistory:options.toolHistory,sessionId}};
 }
 const externalRevisions=new Map(),externalEditing=new Set();
 lifecycle=new SessionLifecycle({directory,engine,readSnapshot,blockReason:id=>blacklist.evaluate(id),quote:s=>selected==='parent'?quoteParent(s.options,new Date().toISOString()):quotePrice(profiles.current(),new Date().toISOString()),config:Object.fromEntries(LIFECYCLE_KEYS.map(k=>[k,initial[k]??LIFECYCLE_DEFAULTS[k]]))});
 function refresh(sessionId,{force=false}={}){
  syncInstructions();
  const state={...lifecycle.inspect(sessionId,{force}),profileFile:selected};
  if(state.eligible)state.cachedResult=engine.peek(sessionId);
  return state;
 }
 function hasPendingInbox(events){
  const lists={'next-turn':[],'next-step':[]};
  for(const e of events)if(e.type==='agent/inbox/spliced'){const d=e.data,list=lists[d.target];if(list)list.splice(d.start,d.removedCount??0,...d.inserted??[])}
  return Object.values(lists).some(x=>x.length);
 }
 function metadataFrom(session){
  const events=session.snapshotEvents(),own=events.filter(e=>e.seq>=(session.inheritedEventCount??0));
  const submissions=[];
  for(const e of own)if(e.type==='agent/inbox/spliced')for(const m of e.data.inserted??[])if(m.source?.kind==='user'&&!submissions.some(x=>x.id===m.id))submissions.push({at:e.time,id:m.id,seq:e.seq});
  if(!submissions.length)for(const e of own)if(e.type==='user/message'&&e.data.source?.kind==='user')submissions.push({at:e.time,id:e.data.id,seq:e.seq});
  const lastSubmission=submissions.at(-1),lastUserSentAt=lastSubmission?.at??null,lastUserId=lastSubmission?.id??null;
  const finalAssistant=[...events].reverse().find(e=>e.type==='assistant/message');
  const start=[...events].reverse().find(e=>e.type==='turn/start'),end=[...events].reverse().find(e=>e.type==='turn/end'),step=[...events].reverse().find(e=>e.type==='step/end');
  return {sessionId:session.id,lastUserSentAt,lastUserId,lastEventSeq:events.at(-1)?.seq??-1,normal:end?.data?.reason?.kind==='completed'&&(lastSubmission?.seq??-1)<=(end?.seq??-1)&&!!step&&step.data.turn===end.data.turn&&(!step.data.reason||step.data.reason.kind==='stop')&&finalAssistant?.data?.turn===end.data.turn&&(start?.seq??0)<=(end?.seq??-1)&&!hasPendingInbox(events),subagent:session.header.origin==='subagent'};
 }
 async function withSession(id,read){
  const live=ctx.sessions.get(id);if(live)return read(live);
  const query=ctx.get('sessionQuery');if(!query)throw Object.assign(Error('History query unavailable'),{code:'HISTORY_UNAVAILABLE'});
  if(typeof query.inspectSession==='function')return query.inspectSession(id,read);
  // rc.1 exposes a read observation but not inspectSession. Prepare an unpublished
  // native Session; never enter or announce it, and never create an Agent.
  const observation=await query.observeSession(id,{projectionMode:'none'});
  try{const session=ctx.sessions.prepare(id,{seed:observation.events,meta:structuredClone(observation.header),inheritedEventCount:observation.inheritedEventCount});return read(session);}
  finally{observation[Symbol.dispose]?.();}
 }
 async function prepareSession(id){
  if(blacklist.evaluate(id).blacklisted)return;
  const live=ctx.sessions.get(id);
  if(live){const meta=metadataFrom(live);lifecycle.metadata(id,meta);preparedSources.set(id,readSnapshot(id,live));while(preparedSources.size>64)preparedSources.delete(preparedSources.keys().next().value);return;}
  try{const value=await withSession(id,session=>({meta:metadataFrom(session),snapshot:readSnapshot(id,session)}));lifecycle.metadata(id,value.meta);preparedSources.set(id,value.snapshot);while(preparedSources.size>64)preparedSources.delete(preparedSources.keys().next().value);}
  catch(error){preparedSources.delete(id);lifecycle.notify(id,'history-read-failed',{code:String(error.code??'HISTORY_UNAVAILABLE')});}
 }
 async function listCandidates(ids){
  const query=ctx.get('sessionQuery');const records=ids?ids.map(id=>({header:{id}})):await query.listSessions();
  const candidates=[];
  // Only detached metadata crosses this boundary. A bounded number of readers
  // inspect history; model-context preparation happens only for selected ids.
  for(let i=0;i<records.length;i+=4){
   const rows=await Promise.all(records.slice(i,i+4).map(async record=>{if(blacklist.evaluate(record.header.id).blacklisted)return null;try{return await withSession(record.header.id,metadataFrom)}catch(e){lifecycle.notify(record.header.id,'history-read-failed',{code:String(e.code??'HISTORY_UNAVAILABLE')});return null}}));
   for(const x of rows)if(x&&!x.subagent&&x.lastUserSentAt!==null){lifecycle.metadata(x.sessionId,x);candidates.push(x)}
  }
  return candidates;
 }
 contextEvents=new ContextEvents(lifecycle);
 coordinator=new EventCoordinator({lifecycle,engine,prepare:prepareSession,refresh,listCandidates,schedule:fn=>typeof ctx.agents.withoutInitiator==='function'?ctx.agents.withoutInitiator(()=>setImmediate(fn)):setImmediate(fn),refreshCandidate:x=>{const live=ctx.sessions.get(x.sessionId);return live?metadataFrom(live):x;}});

 function balanceState(id){const snapshot=engine.snapshots.get(id)??preparedSources.get(id);return snapshot?balanceWatchdog.status(profiles.current(),snapshot):null}
 function processState(id){
  const pref=lifecycle.preference(id),r=lifecycle.saved.threads[id],record=lifecycle.records.get(id),result=engine.results.get(id),job=engine.jobs.get(id),agent=ctx.agents.get(id);
  let phase=!engine.config.enabled?'disabled':pref.blacklisted?pref.blacklistReason:!pref.threadEnabled?'thread-disabled':pref.suspended?'paused':agent?.status==='running'?'assistant-running':r?.awaitingAssistant?'awaiting-assistant':job&&!job.controller.signal.aborted?'requesting':coordinator.pending.has(id)?'queued':coordinator.currentId===id?'checking':balanceState(id)?.paused&&result?.status!=='ready'?'balance-paused':record&&!record.invalidated&&result?.revision===record.revision?(r?.consumedRevision===record.revision?'accepted':result.status==='ready'?'ready':result.status==='abstained'?'abstained':'failed'):'no-pending-prediction';
  return {...pref,phase,balance:balanceState(id),events:lifecycle.events(id),watchdog:lifecycle.watchdog.policy(id,record?.mapping.tokens??0),queued:coordinator.pending.has(id)};
 }
 const controller={
  async profiles(){const instructionInfo=syncInstructions();return {instructionInfo,blacklist:blacklist.publicState(),profiles:[{id:'parent',filePath:'parent',label:'父请求后端'},...await manager.list()],...engine.settings(),...lifecycle.config,profileFile:selected,activePriceQuote:quotePrice(profiles.current(),new Date().toISOString())}},
  blacklist(){return blacklist.publicState()},
  setBlacklist(payload){
   const ids=new Set([...Object.keys(lifecycle.saved.threads),...lifecycle.records.keys(),...engine.snapshots.keys(),...engine.jobs.keys(),...coordinator.pending.keys()]);
   if(payload.scope==='thread')ids.add(payload.id);
   const before=new Map([...ids].map(id=>[id,blacklist.evaluate(id).blacklistReason]));
   const state=blacklist.set(payload),affected=[];
   for(const id of ids){const next=blacklist.evaluate(id);if(before.get(id)===next.blacklistReason)continue;affected.push(id);coordinator.pending.delete(id);engine.cancel(id,'blacklist-changed');lifecycle.dirty.add(id);const record=lifecycle.records.get(id);if(record)record.invalidated=true;const r=lifecycle.saved.threads[id];if(next.blacklisted&&r){r.fulfilledEpoch=r.activeEpoch??r.fulfilledEpoch??0;r.retroGrant=false;r.remapPending=false;}lifecycle.notify(id,next.blacklistReason??'blacklist-removed');}
   lifecycle.persist();return {...state,affectedSessionIds:affected};
  },
  state(sessionId){return refresh(sessionId)},
  prepareSession,
  watch({sessionId,afterVersion},{signal}={}){return lifecycle.watch(sessionId,afterVersion,signal)},
  async bootstrap(payload={}){return coordinator.bootstrap(payload)},
  async checkBalance({sessionId,checkpoint,force=false}){
   if(!lifecycle.canSample(sessionId)||!engine.config.enabled)return {paused:false,skipped:true};if(!force&&!balanceWatchdog.pendingSessions().length)return {skipped:true};
   let snapshot=engine.snapshots.get(sessionId)??preparedSources.get(sessionId);if(!snapshot){const options=requests.get(sessionId)??lifecycle.main.get(sessionId)?.options??ctx.sessions.get(sessionId)?.requestHeader()?.config;if(options)snapshot={sessionId,options}}
   if(!snapshot){snapshot=await withSession(sessionId,s=>({sessionId,options:s.requestHeader()?.config??{}}))}return balanceWatchdog.pulse({profile:profiles.current(),snapshot,checkpoint:checkpoint??'explicit',force});
  },
  async bootstrapBalance(reason='startup'){for(const id of balanceWatchdog.pendingSessions())await controller.checkBalance({sessionId:id,checkpoint:reason})},
  async bootstrapInitial(){if(lifecycle.saved.eventBackfillInitialized)return [];const result=await coordinator.bootstrap();if(result!==null){lifecycle.saved.eventBackfillInitialized=true;lifecycle.persist()}return result},
  observe(payload){const observation=lifecycle.observe(payload);return {...refresh(payload.sessionId,{force:!!payload.force}),observation}},
  thread({sessionId}){return {...lifecycle.preference(sessionId),newThreadsEnabled:lifecycle.config.newThreadsEnabled}},
  setThread(payload){const value=lifecycle.setThread(payload);if(payload.enabled)void coordinator.bootstrap({ids:[payload.sessionId],reason:'thread-enabled'});return {...value,sessionId:payload.sessionId}},
  async accept({sessionId,expectedTurnId,expectedRevision,expectedConfigVersion,leaseId}){
   await prepareSession(sessionId);const state=refresh(sessionId,{force:true});
   const valid=lifecycle.canSample(sessionId,leaseId)&&state.eligible&&state.expectedTurnId===expectedTurnId&&state.revision===expectedRevision&&(expectedConfigVersion===undefined||expectedConfigVersion===engine.epoch);
   if(valid)lifecycle.consume(sessionId,expectedRevision);
   return {valid,revision:state.revision??null};
  },
  async sample(payload,{signal}={}){
   if(!lifecycle.canSample(payload.sessionId))return {suggestion:null,reason:lifecycle.preference(payload.sessionId).blacklistReason??'inactive',canRetry:false};
   await prepareSession(payload.sessionId);const state=refresh(payload.sessionId,{force:true});
   if(!state.eligible||state.expectedTurnId!==payload.expectedTurnId||(payload.expectedRevision!==undefined&&state.revision!==payload.expectedRevision))return {suggestion:null,reason:'stale',canRetry:false};
   const epoch=lifecycle.saved.threads[payload.sessionId]?.userEpoch;
   let result;
   if(payload.trigger==='manual_retry'){
    result=await engine.sample({...payload,signal:undefined,leaseId:'backend-manual:'+(payload.requestId??state.revision),allowDispatch:true});
    lifecycle.finished(payload.sessionId,state.revision,epoch,result);
   }else if(engine.peek(payload.sessionId))result=await engine.sample({...payload,signal,allowDispatch:false});
   else if(state.canGenerate){
    const waiter=new AbortController(),key=payload.sessionId+':'+(payload.leaseId??'view');
    let group=uiWaiters.get(key);if(!group)uiWaiters.set(key,group=new Set());group.add(waiter);
    try{result=await coordinator.waitFor(payload.sessionId,state.revision,{signal:signal?AbortSignal.any([signal,waiter.signal]):waiter.signal})}
    finally{group.delete(waiter);if(!group.size)uiWaiters.delete(key)}
   }else result={suggestion:null,reason:'cache-only',canRetry:false,revision:state.revision};
   await prepareSession(payload.sessionId);
   if(!lifecycle.canSample(payload.sessionId,payload.leaseId)||!lifecycle.snapshotCurrent(engine.snapshots.get(payload.sessionId)??{sessionId:payload.sessionId}))return {suggestion:null,reason:'stale',canRetry:false};
   return result;
  },
  cancel(payload){const id=typeof payload==='string'?payload:payload.sessionId,key=id+':'+(payload.leaseId??'view'),group=uiWaiters.get(key);if(group?.size){for(const waiter of group)waiter.abort();return {cancelled:true}}return controller.engine.cancelConsumer(id,payload.leaseId)},
  configure(payload){
   const operation=configurationQueue.then(async()=>{
    const {profileFile,reloadProfile,instructionText:nextInstruction,...allPatch}=payload;
    const lifecyclePatch=Object.fromEntries(LIFECYCLE_KEYS.filter(k=>allPatch[k]!==undefined).map(k=>[k,allPatch[k]]));
    validateLifecycle(lifecyclePatch);
    const patch=Object.fromEntries(Object.entries(allPatch).filter(([k])=>!LIFECYCLE_KEYS.includes(k)));
    if(nextInstruction!==undefined){
     if(Object.keys(payload).length!==1||typeof nextInstruction!=='string'||Buffer.byteLength(nextInstruction)>engine.config.instructionMaxBytes||nextInstruction.includes('\0'))throw Error('Invalid extra instructions');
     await writeFile(instructionPath+'.tmp',nextInstruction,{mode:0o600});await rename(instructionPath+'.tmp',instructionPath);
     return {...engine.settings(),profileFile:selected,instructionInfo:syncInstructions()};
    }
    if(profileFile!==undefined&&typeof profileFile!=='string')throw new Error('invalid profile file');
    engine.configure(patch,{validateOnly:true});
    let nextManager=manager,nextSelected=profileFile??selected;
    if(nextSelected!=='parent'&&(profileFile!==undefined||reloadProfile)){
     nextManager=makeManager();
     await nextManager.select(reloadProfile&&profileFile===undefined?manager.current().filePath:nextSelected);
    }
    const next={...engine.config,...patch,...lifecycle.config,...lifecyclePatch};
    const persistent=Object.fromEntries(['enabled','prompt','promptVersion','timeoutMs','liveSampleRate','catchUpSampleRate',...POLICY_KEYS,...LIFECYCLE_KEYS].map(key=>[key,next[key]]));
    const file=join(directory,'settings.json'),temp=file+'.tmp';
    await writeFile(temp,JSON.stringify({...persistent,profileFile:nextSelected}),{mode:0o600});await rename(temp,file);
    const wasEnabled=engine.config.enabled;
    if(patch.enabled===false){for(const r of Object.values(lifecycle.saved.threads)){r.fulfilledEpoch=r.activeEpoch??r.fulfilledEpoch??0;r.activation=null;r.remapPending=false;r.retroGrant=false}lifecycle.persist()}
    routePricebooks=(await nextManager.list()).filter(p=>p.mainRoute);
    manager=nextManager;selected=nextSelected;engine.configure(patch);lifecycle.configure(lifecyclePatch);
    if(lifecyclePatch.balanceWatchdogEnabled===true)void controller.bootstrapBalance('enabled:'+engine.epoch);
    if(engine.config.enabled&&(!wasEnabled||Object.keys(lifecyclePatch).some(k=>k.startsWith('retroactive'))))void coordinator.bootstrap({reason:wasEnabled?'window-settings-changed':'feature-enabled'});
    return {...engine.settings(),...lifecycle.config,profileFile:selected};
   });
   configurationQueue=operation.catch(()=>{});
   return operation;
  },
  async usage({sessionId,...filters}={}){const totals=await accounting.summary(ledger,sessionId,filters);return {...totals.prediction,budget:gate.state(),process:sessionId?processState(sessionId):null,threadAccounting:{...totals.share,main:totals.main,sinceInstall:totals.sinceInstall,unpricedReasons:totals.unpricedReasons,trackingStartedAt:totals.trackingStartedAt}}},
  async *trackMain(options,stream){let generated=false;for await(const chunk of accounting.track(options,stream)){if(['text-delta','block-end','tool-call-delta'].includes(chunk.type))generated=true;if(options.sessionId&&!options.purpose&&generated&&chunk.type==='finish'&&['stop','tool-calls'].includes(typeof chunk.reason==='string'?chunk.reason:chunk.reason?.kind))balanceWatchdog.succeeded({profile:null,snapshot:{sessionId:options.sessionId,options}});if(options.sessionId&&!options.purpose&&chunk.type==='finish'&&chunk.reason?.kind==='error'&&chunk.reason.failure?.code==='QUOTA')balanceWatchdog.rejected({profile:null,snapshot:{sessionId:options.sessionId,options},trigger:'manual_retry'});yield chunk}},
  async close(){if(closed)return;closed=true;const queued=coordinator.close();lifecycle.close();instructionWatcher?.close();clearImmediate(instructionTimer);await configurationQueue;try{await balanceWatchdog.close();await engine.dispose();await queued}finally{try{await accounting.close()}finally{resultCache.close();lease.close()}}},
  capture(options){if(options.sessionId&&!options.purpose){contextEvents.flush(options.sessionId);const {signal,messages,...rest}=options;if(lifecycle.active(options.sessionId)){const session=ctx.sessions.get(options.sessionId),header=session?.requestHeader();const canonicalOptions=header?{...header.config,tools:header.tools,toolHistory:session.toolHistory(),sessionId:options.sessionId,messages:session.deriveMessages()}:undefined;lifecycle.captureMain(detached({...rest,messages}),canonicalOptions?detached(canonicalOptions):undefined);}requests.delete(options.sessionId);requests.set(options.sessionId,detached(rest));while(requests.size>64){const id=requests.keys().next().value;requests.delete(id);engine.invalidate(id)}}},
  invalidate(id){requests.delete(id);preparedSources.delete(id);lifecycle.markDirty(id)},
  runtimeDetached(id){const session=ctx.sessions.get(id);if(session){const snapshot=readSnapshot(id,session);if(snapshot)preparedSources.set(id,snapshot)}lifecycle.notify(id,'runtime-detached');coordinator.enqueue(id,'live')},
  feedbackMain(options,usage){lifecycle.feedbackMain(options,usage)},
  externalChanged(id,{editing}={}){accounting.invalidateHistory(id);preparedSources.delete(id);if(editing===true)externalEditing.add(id);else if(editing===false)externalEditing.delete(id);externalRevisions.set(id,(externalRevisions.get(id)??0)+1);lifecycle.remap(id,editing===true?'external-editing':'context-changed');if(editing!==true)coordinator.enqueue(id,'catch_up')},
  userSent(id,details){preparedSources.delete(id);const accepted=lifecycle.userSent(id,details);if(accepted&&balanceWatchdog.pendingSessions().length)setImmediate(()=>void controller.checkBalance({sessionId:id,checkpoint:'send:'+id+':'+lifecycle.saved.threads[id]?.userEpoch}).catch(()=>{}));return accepted},
  completed(id,details){contextEvents.flush(id);const normal=lifecycle.completed(id,details);if(normal){coordinator.enqueue(id,'live');if(balanceWatchdog.pendingSessions().length)setImmediate(()=>void controller.checkBalance({sessionId:id,checkpoint:'loop:'+id+':'+lifecycle.saved.threads[id]?.userEpoch+':'+details.seq}).catch(()=>{}))}return normal},
  created(id,details){lifecycle.created(id,details)},
  onSessionEvent(session,event){
   if(event.surfaceOp!==undefined||['agent/inbox/spliced','turn/start','request/header','request/context','developer/message','tool/result'].includes(event.type)||/compact|rewrite|rollback|truncate/.test(event.type))preparedSources.delete(session.id);
   if(contextEvents.handle(session.id,event))return;
   if(event.type==='agent/inbox/spliced'){for(const message of event.data.inserted??[])if(message.source?.kind==='user')controller.userSent(session.id,{id:message.id,at:event.time,queued:event.data.target==='next-step'})}
   if(event.type==='turn/end'){const step=[...session.snapshotEvents()].reverse().find(e=>e.type==='step/end');controller.completed(session.id,{seq:event.seq,turn:event.data.turn,normal:event.data.reason?.kind==='completed'&&!!step&&step.data.turn===event.data.turn&&(!step.data.reason||step.data.reason.kind==='stop')&&[...session.snapshotEvents()].reverse().find(e=>e.type==='assistant/message')?.data?.turn===event.data.turn});}
   else if(event.surfaceOp!==undefined||['turn/start','request/header','request/context','user/message','assistant/message','system/message','developer/message','tool/result'].includes(event.type)||/compact|rewrite|rollback|truncate/.test(event.type)){lifecycle.markDirty(session.id,/compact/.test(event.type)?'context-compacted':'context-changed');if(/compact|rewrite|rollback|truncate/.test(event.type))lifecycle.remap(session.id,'context-changed')}
   lifecycle.tick(session.id);
  },
  coordinator,lifecycle,blacklistStore:blacklist,
  engine,balanceWatchdog
 };
 syncInstructions();
 instructionWatcher=watch(directory,{persistent:false},(_event,file)=>{if(String(file)==='instruction_prediction.md'){clearImmediate(instructionTimer);instructionTimer=setImmediate(()=>{if(!closed)try{syncInstructions()}catch{}})}});
 instructionWatcher.on('error',()=>{instructionError='INSTRUCTION_WATCH';engine.changed()});
 return controller;
 }catch(error){try{ledger?.close();await accounting?.close();resultCache?.close()}finally{lease.close()}throw error}
}
export async function apply(ctx,config){
 const controller=await createController(ctx,config);
 ctx.effect(()=>()=>controller.close(),'composer-prediction.lifecycle');
 ctx.on('llm/stream',async function*(options,next){controller.capture(options);for await(const chunk of controller.trackMain(options,next())){if(chunk.type==='usage'&&!options.purpose)controller.feedbackMain(options,chunk.usage);yield chunk;}});
 const startup=Date.now();
 ctx.on('session/created',session=>controller.created(session.id,{newSession:session.header.createdAt>=startup}));
 ctx.on('agent/status',({agent,status})=>{if(status==='running')controller.lifecycle.markDirty(agent.id,'assistant-running');else if(status==='idle'){controller.lifecycle.signal(agent.id);controller.coordinator.enqueue(agent.id,'live')}});
 ctx.on('session/event',(session,event)=>controller.onSessionEvent(session,event));
 ctx.on('composer-prediction/context-invalidated',({sessionId,...details})=>controller.externalChanged(sessionId,details));
 ctx.inject(['sessionQuery'],()=>{void controller.bootstrapInitial().then(()=>controller.bootstrapBalance())});
 ctx.on('credentials/reference-updated',()=>{controller.engine.changed();void controller.bootstrapBalance('credentials:'+controller.engine.epoch)});
 ctx.on('credentials/record-updated',()=>{controller.engine.changed();void controller.bootstrapBalance('credentials:'+controller.engine.epoch)});
 ctx.on('agent/disposed',({agent})=>controller.runtimeDetached(agent.id));
 ctx.effect(()=>mountRpc(ctx,controller),'composer-prediction.rpc');
}
