import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {join} from 'node:path';
import {fingerprint,mapContext,mappingDescriptor,chooseContext} from './context-mapping.mjs';
import {LoopWatchdog} from './loop-watchdog.mjs';
export const LIFECYCLE_DEFAULTS={newThreadsEnabled:true,watchdogEnabled:true,balanceWatchdogEnabled:true,minRetainedCacheRatio:0.5,contextTargetTokens:32768,contextQualityCostSlack:0.05,retroactiveEnabled:true,retroactiveHours:24,retroactiveLimit:3};
export const LIFECYCLE_KEYS=Object.keys(LIFECYCLE_DEFAULTS);
export function validateLifecycle(p){
 for(const k of ['newThreadsEnabled','watchdogEnabled','balanceWatchdogEnabled','retroactiveEnabled'])if(p[k]!==undefined&&typeof p[k]!=='boolean')throw Error('Invalid lifecycle setting');
 for(const [k,min,max]of [['minRetainedCacheRatio',0.5,1],['contextQualityCostSlack',0,0.25],['retroactiveHours',1,87600],['retroactiveLimit',1,100]])if(p[k]!==undefined&&(!Number.isFinite(p[k])||p[k]<min||p[k]>max))throw Error('Invalid lifecycle threshold');
 if(p.retroactiveLimit!==undefined&&!Number.isInteger(p.retroactiveLimit))throw Error('Invalid retrospective limit');
 if(p.contextTargetTokens!==undefined&&(!Number.isSafeInteger(p.contextTargetTokens)||p.contextTargetTokens<1024||p.contextTargetTokens>1048576))throw Error('Invalid context target');
}
function read(path,fallback){try{return JSON.parse(readFileSync(path,'utf8'))}catch(e){if(e.code==='ENOENT')return fallback;throw e}}
function write(path,value){writeFileSync(path+'.tmp',JSON.stringify(value),{mode:0o600});renameSync(path+'.tmp',path)}
/** One current persisted result per conversation, with no age expiry or global LRU eviction. */
export class ResultCache{
 constructor(directory){
  this.db=new DatabaseSync(join(directory,'prediction-results.sqlite'));
  this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS cache_meta (key TEXT PRIMARY KEY,value TEXT); CREATE TABLE IF NOT EXISTS results (key TEXT PRIMARY KEY, session_id TEXT NOT NULL, payload TEXT NOT NULL); CREATE INDEX IF NOT EXISTS result_sessions ON results(session_id);');
  if(!this.db.prepare("SELECT 1 FROM cache_meta WHERE key='legacy-imported'").get()){
   const legacy=read(join(directory,'result-cache.json'),{entries:[]});
   for(const [key,row]of legacy.entries??[])if(!this.db.prepare('SELECT 1 FROM results WHERE key=?').get(key))this.set(key,{...row.value,sourceSessionId:row.value.sourceSessionId??'legacy:'+key});
   this.db.prepare("INSERT INTO cache_meta(key,value) VALUES('legacy-imported','yes')").run();
  }
 }
 get(key){const row=this.db.prepare('SELECT payload FROM results WHERE key=?').get(key);return row?JSON.parse(row.payload):null}
 set(key,value){
  const sid=value.sourceSessionId??'legacy:'+key;
  this.db.exec('BEGIN IMMEDIATE');try{this.db.prepare('DELETE FROM results WHERE session_id=? AND key<>?').run(sid,key);this.db.prepare('INSERT INTO results(key,session_id,payload) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET session_id=excluded.session_id,payload=excluded.payload').run(key,sid,JSON.stringify(value));this.db.exec('COMMIT')}catch(e){this.db.exec('ROLLBACK');throw e}
 }
 delete(key){this.db.prepare('DELETE FROM results WHERE key=?').run(key)}
 close(){this.db.close()}
}
/** Only explicit user submissions create live activation. Observing a window is read-only. */
export class SessionLifecycle{
 constructor({directory,engine,readSnapshot,quote,now=()=>Date.now(),config={},blockReason=()=>({blacklisted:false})}){
  Object.assign(this,{directory,engine,readSnapshot,quote,now,blockReason});this.path=join(directory,'thread-predictions.json');this.saved=read(this.path,{version:2,threads:{}});
  this.config={...LIFECYCLE_DEFAULTS,...config};validateLifecycle(this.config);
  this.records=new Map();this.main=new Map();this.dirty=new Set();this.watchdog=new LoopWatchdog();this.views=new Map();this.listeners=new Map();this.versions=new Map();this.closed=false;
 }
 persist(){write(this.path,this.saved)}
 preference(id){const r=this.saved.threads[id];return {...this.blockReason(id),threadEnabled:r?.enabled??r?.bornEnabled??true,suspended:r?.suspended??null,lastUserSentAt:r?.lastUserSentAt??null,activation:r?.activation??null};}
 created(id,{newSession=true}={}){if(!this.saved.threads[id]){this.saved.threads[id]={...(newSession?{bornEnabled:this.config.newThreadsEnabled}:{}),events:[]};this.persist()}}
 metadata(id,{lastUserSentAt,lastUserId,normal}={}){const r=this.saved.threads[id]??={};let changed=false;if(Number.isFinite(lastUserSentAt)&&lastUserId!==r.lastUserId&&lastUserSentAt>(r.lastUserSentAt??0)){r.lastUserSentAt=lastUserSentAt;r.lastUserId=lastUserId;changed=true}if(normal===true&&r.awaitingAssistant&&r.activation!=='user-send'){r.awaitingAssistant=false;changed=true;this.dirty.add(id)}if(changed)this.persist()}
 userSent(id,{id:messageId,at=this.now(),queued=false}={}){
  const r=this.saved.threads[id]??={};if(messageId&&r.lastUserId===messageId)return false;
  r.seenUserIds??=[];if(messageId&&r.seenUserIds.includes(messageId))return false;if(messageId){r.seenUserIds.push(messageId);if(r.seenUserIds.length>512)r.seenUserIds.shift();}
  r.lastUserId=messageId??'submission:'+((r.userEpoch??0)+1);r.lastUserSentAt=at;r.userEpoch=(r.userEpoch??0)+1;r.activation='user-send';r.activeEpoch=r.userEpoch;if(!this.engine.config.enabled||!this.preference(id).threadEnabled||this.preference(id).blacklisted)r.fulfilledEpoch=r.userEpoch;r.awaitingAssistant=true;r.consumedRevision=null;
  this.persist();this.watchdog.user(id,{queued});this.markDirty(id,'user-submitted');return true;
 }
 completed(id,{normal,seq,turn}={}){const r=this.saved.threads[id]??={};r.completion={normal:!!normal,seq:Number.isSafeInteger(seq)?seq:null,turn:turn??null,userEpoch:r.userEpoch??null};this.watchdog.completed(id);if(!normal){r.awaitingAssistant=true;this.persist();this.markDirty(id,'assistant-not-completed');return false;}r.awaitingAssistant=false;this.persist();this.notify(id,'assistant-completed',{turn:turn??null,automaticEligible:this.canGenerate(id)});return true}
 configure(patch){validateLifecycle(patch);Object.assign(this.config,patch);if(patch.retroactiveEnabled===false)for(const [id,r]of Object.entries(this.saved.threads))if(r.activation==='retroactive'){r.retroGrant=false;this.engine.cancel(id,'retroactive-disabled');this.notify(id,'retroactive-disabled')}for(const [id,r]of this.records){r.plan=null;this.dirty.add(id);this.notify(id,'configuration-changed')}}
 setThread({sessionId,enabled}){this.saved.threads[sessionId]={...this.saved.threads[sessionId],enabled,suspended:null};if(enabled){delete this.saved.threads[sessionId].mapping;this.saved.threads[sessionId].activation=null;}this.persist();this.engine.invalidate(sessionId);this.records.delete(sessionId);this.notify(sessionId,enabled?'thread-enabled':'thread-disabled');return this.preference(sessionId)}
 suspend(id,reason,data={}){this.saved.threads[id]={...this.saved.threads[id],enabled:this.preference(id).threadEnabled,suspended:reason};this.persist();this.engine.invalidate(id);this.notify(id,reason,data)}
 active(id){const p=this.preference(id);return p.activation==='user-send'||p.activation==='retroactive'}
 canGenerate(id){const p=this.preference(id),r=this.saved.threads[id];return this.engine.config.enabled&&p.threadEnabled&&!p.blacklisted&&!p.suspended&&!r?.awaitingAssistant&&((p.activation==='user-send'&&(r.activeEpoch??0)>(r.fulfilledEpoch??0))||(p.activation==='retroactive'&&r.retroGrant===true&&r.retroEpoch===this.engine.epoch)||r?.remapPending===true||!!(r?.balanceRecoveryGrant&&r.balanceRecoveryGrant.userEpoch===(r.userEpoch??null)&&this.records.get(id)?.revision===r.balanceRecoveryGrant.revision));}
 canSample(id){const p=this.preference(id);return this.engine.config.enabled&&p.threadEnabled&&!p.blacklisted&&!p.suspended;}
 observe({sessionId,leaseId,sequence,active,ready=true}){const old=this.views.get(leaseId);if(old&&sequence<=old.sequence)return {accepted:false};this.views.set(leaseId,{sessionId,leaseId,sequence,visible:active,ready});if(this.views.size>128)this.views.delete(this.views.keys().next().value);return {accepted:true,active:true};}
 signal(id){if(this.closed)return;this.versions.set(id,(this.versions.get(id)??0)+1);for(const fn of [...this.listeners.get(id)??[]])fn()}
 version(id){return (this.versions.get(id)??0)+(id==='__global__'?0:this.versions.get('__global__')??0)}
 events(id){const own=this.saved.threads[id]?.events??[];return id==='__global__'?own:[...(this.saved.threads.__global__?.events??[]),...own].sort((a,b)=>a.at-b.at||(a.order??0)-(b.order??0)).slice(-32)}
 notify(id,code,data={}){
  const r=this.saved.threads[id]??={},event={code,data,sourceRevision:data.sourceRevision??this.records.get(id)?.revision??null,userEpoch:r.userEpoch??null,at:this.now(),id:fingerprint({code,data,revision:this.records.get(id)?.revision,userEpoch:r.userEpoch})};
  r.events??=[];if(r.events.at(-1)?.id===event.id&&['history-read-failed','retroactive-read-failed','connection-error'].includes(code))return;
  if(r.events.at(-1)?.id!==event.id){event.order=this.saved.eventSequence=(this.saved.eventSequence??0)+1;r.events.push(event);if(r.events.length>32)r.events.shift();this.persist()}
  this.versions.set(id,(this.versions.get(id)??0)+1);for(const set of (id==='__global__'?[...this.listeners.values()]:[this.listeners.get(id)??[]]))for(const fn of [...set])fn();
 }
 watch(id,afterVersion,signal){
  if(this.version(id)>afterVersion)return Promise.resolve({version:this.version(id),event:this.events(id).at(-1)??null});
  return new Promise((resolve,reject)=>{const done=()=>{cleanup();resolve({version:this.version(id),event:this.events(id).at(-1)??null})},abort=()=>{cleanup();reject(signal.reason??Error('cancelled'))},cleanup=()=>{this.listeners.get(id)?.delete(done);signal?.removeEventListener('abort',abort)};
   let set=this.listeners.get(id);if(!set)this.listeners.set(id,set=new Set());set.add(done);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  });
 }
 markDirty(id,reason='context-changed'){const already=this.dirty.has(id),candidate=this.engine.results.get(id),job=this.engine.jobs.get(id),hadPrediction=!!candidate?.suggestion||!!(job&&!job.controller.signal.aborted);this.dirty.add(id);this.watchdog.changed(id);this.engine.invalidate(id);const r=this.records.get(id);if(r)r.invalidated=true;if(reason==='context-changed'){if(hadPrediction)this.notify(id,'prediction-invalidated',{hadPrediction:true});else if(!already)this.notify(id,'context-updated',{hadPrediction:false});}else this.notify(id,reason)}
 captureMain(options,canonicalOptions){if(!options.sessionId||options.purpose)return;const p=this.preference(options.sessionId);if(!p.threadEnabled||p.suspended||!this.active(options.sessionId))return;const ordinal=(this.main.get(options.sessionId)?.ordinal??this.saved.threads[options.sessionId]?.mapping?.mainOrdinal??0)+1;this.main.set(options.sessionId,{options:structuredClone(options),mapping:mapContext(options),canonical:canonicalOptions,userEpoch:this.saved.threads[options.sessionId]?.userEpoch,ordinal});this.markDirty(options.sessionId,'parent-request');while(this.main.size>64)this.main.delete(this.main.keys().next().value)}
 alignParent(current){
  const parent=this.main.get(current.sessionId),base=parent?.canonical;if(!base||parent.options.provider!==current.provider||parent.options.model!==current.model)return current;
  const header=x=>{const {messages,...rest}=x;return rest};
  if(fingerprint(header(base))!==fingerprint(header(current))||base.messages.length>current.messages.length||base.messages.some((m,i)=>fingerprint(m)!==fingerprint(current.messages[i])))return current;
  return {...current,...parent.options,toolHistory:current.toolHistory,messages:[...parent.options.messages,...current.messages.slice(base.messages.length)]};
 }
 feedbackMain(options,usage){const r=this.main.get(options.sessionId);if(!r)return;const old=r.usage??{};this.watchdog.usage(options.sessionId,{inputTokens:Math.max(0,(usage.inputTokens??0)-(old.inputTokens??0)),cacheReadTokens:Math.max(0,(usage.cacheReadTokens??0)-(old.cacheReadTokens??0)),outputTokens:Math.max(0,(usage.outputTokens??0)-(old.outputTokens??0))});r.usage=usage;}
 feedbackPrediction(snapshot,usage){const r=this.records.get(snapshot.sessionId);if(r&&r.revision===snapshot.revision&&usage?.status==='known'){
  r.observedHitRatio=(usage.cacheReadTokens??0)/Math.max(1,usage.inputTokens??0);r.predictionMapping=mapContext(snapshot.options);
  this.saved.threads[snapshot.sessionId]={...this.saved.threads[snapshot.sessionId],predictionMapping:mappingDescriptor(r.predictionMapping),predictionCacheRoute:r.cacheRoute};this.persist();
  if(r.observedHitRatio<0.5)this.notify(snapshot.sessionId,'low-observed-cache-hit',{ratio:r.observedHitRatio});
 }}
 selectRetrospective(candidates){
  if(!this.config.retroactiveEnabled)return [];
  const cutoff=this.now()-this.config.retroactiveHours*3600000;
  const ranked=candidates.filter(x=>Number.isFinite(x.lastUserSentAt)&&x.lastUserSentAt>=cutoff&&x.lastUserSentAt<=this.now()&&this.preference(x.sessionId).threadEnabled&&!this.preference(x.sessionId).blacklisted&&!this.preference(x.sessionId).suspended)
   .sort((a,b)=>b.lastUserSentAt-a.lastUserSentAt||a.sessionId.localeCompare(b.sessionId));
  const selected=ranked.slice(0,this.config.retroactiveLimit),ids=new Set(selected.map(x=>x.sessionId));
  for(const x of candidates)if(!ids.has(x.sessionId)){const r=this.saved.threads[x.sessionId];if(r?.activation==='retroactive'){r.retroGrant=false;this.engine.cancel(x.sessionId,'retroactive-window-changed')}this.notify(x.sessionId,x.lastUserSentAt<cutoff?'retroactive-outside-window':'retroactive-limit',{limit:this.config.retroactiveLimit,hours:this.config.retroactiveHours});}
  for(const x of selected){const r=this.saved.threads[x.sessionId]??={};if(r.completion?.userEpoch===r.userEpoch&&Number.isSafeInteger(r.completion?.seq)&&Number.isSafeInteger(x.lastEventSeq)&&r.completion.seq>x.lastEventSeq)x.normal=r.completion.normal;if(r.activation==='user-send'&&(r.activeEpoch??0)>(r.fulfilledEpoch??0))continue;r.activation='retroactive';r.retroGrant=true;r.retroEpoch=this.engine.epoch;r.awaitingAssistant=x.normal===false;this.notify(x.sessionId,x.normal===false?'retroactive-waiting-normal-reply':'retroactive-selected',{lastUserSentAt:x.lastUserSentAt})}
  this.persist();return selected;
 }
 inspect(id,{force=false}={}){
  const pref=this.preference(id);
  if(!this.engine.config.enabled||!pref.threadEnabled||pref.blacklisted||pref.suspended)return {enabled:this.engine.config.enabled,...pref,eligible:false,canGenerate:false,reason:pref.blacklistReason??pref.suspended??'thread-disabled',version:this.version(id),events:this.events(id)};
  if(this.saved.threads[id]?.awaitingAssistant)return {enabled:true,...pref,eligible:false,canGenerate:false,reason:'awaiting-normal-assistant',version:this.version(id),events:this.events(id)};
  const old=this.records.get(id),saved=this.saved.threads[id]?.mapping;
  if(!force&&old&&!this.dirty.has(id)&&!old.invalidated&&!this.watchdog.due(id,old.mapping.tokens))return {...old.state,canGenerate:this.canGenerate(id),version:this.version(id),events:this.events(id)};
  const raw=this.readSnapshot(id);
  if(!raw){this.engine.invalidate(id);return {enabled:true,...pref,eligible:false,canGenerate:false,reason:'source-ineligible',version:this.version(id),events:this.events(id)}}
  const mapping=mapContext(raw.options),previous=old??saved,changed=!!previous&&previous.revision!==raw.revision,parent=this.main.get(id);
  const parentMatches=raw.parentCacheReusable!==false&&parent&&parent.options.model===raw.options.model&&parent.options.provider===raw.options.provider;
  let baseline=parentMatches?parent.mapping:previous?.cacheRoute===raw.cacheRoute?(old?.mapping??saved):undefined;
  if(!baseline&&raw.parentCacheReusable!==false&&!changed)baseline=mapContext({...raw.options,messages:raw.options.messages.slice(0,-1)});
  const manualMutation=changed&&previous.turnId===raw.turnId&&(!parent||parent.ordinal<=(old?.mainOrdinal??saved?.mainOrdinal??0));
  const plan=old?.revision===raw.revision&&old.contextWindow===raw.contextWindow&&old.plan?old.plan:chooseContext(raw,{baseline,quote:this.quote(raw),observedHitRatio:old?.observedHitRatio??0.85,
   predictionBaseline:old?.predictionMapping??(this.saved.threads[id]?.predictionCacheRoute===raw.cacheRoute?this.saved.threads[id]?.predictionMapping:null),previousSource:old?.mapping,previousPlan:old?.plan,
   qualityCostSlack:this.config.contextQualityCostSlack,targetTokens:this.config.contextTargetTokens,minRetainedCacheRatio:this.config.minRetainedCacheRatio,forceMutation:manualMutation});
  if(!plan.allowed){if(plan.reason==='cache-prefix-loss')this.suspend(id,plan.reason,{retainedRatio:plan.retainedRatio,threshold:this.config.minRetainedCacheRatio});else this.notify(id,plan.reason);this.engine.invalidate(id);return {enabled:true,...this.preference(id),eligible:false,canGenerate:false,reason:plan.reason,retainedRatio:plan.retainedRatio,version:this.version(id),events:this.events(id)}}
  if(changed)this.engine.invalidate(id);
  const snapshot={...raw,options:plan.options,contextNote:plan.contextNote,contextPlan:plan.decision},cycle=this.watchdog.policy(id,mapping.tokens);
  const state={enabled:true,...pref,eligible:true,canGenerate:this.canGenerate(id)&&(!raw.latestUserMessageId||this.saved.threads[id]?.activation!=='user-send'||raw.latestUserMessageId===this.saved.threads[id]?.lastUserId),expectedTurnId:raw.turnId,latestTurnId:raw.turnId,revision:raw.revision,configVersion:this.engine.epoch,
   consumedRevision:this.saved.threads[id]?.consumedRevision??null,watchdog:cycle,contextPlan:plan.decision};
  this.records.set(id,{revision:raw.revision,contextWindow:raw.contextWindow,turnId:raw.turnId,cacheRoute:raw.cacheRoute,mapping,plan,state,userEpoch:this.saved.threads[id]?.userEpoch,mainOrdinal:parent?.ordinal??0,observedHitRatio:old?.observedHitRatio,predictionMapping:old?.predictionMapping});
  while(this.records.size>64)this.records.delete(this.records.keys().next().value);
  if(!saved||saved.revision!==raw.revision){this.saved.threads[id]={...this.saved.threads[id],mapping:{...mappingDescriptor(mapping),revision:raw.revision,turnId:raw.turnId,cacheRoute:raw.cacheRoute,userEpoch:this.saved.threads[id]?.userEpoch,mainOrdinal:parent?.ordinal??0}};this.persist()}
  this.watchdog.checked(id);this.dirty.delete(id);this.engine.capture(snapshot);
  return {...state,version:this.version(id),events:this.events(id)};
 }
 snapshotCurrent(snapshot){if(this.closed||!this.canSample(snapshot.sessionId))return false;const current=this.readSnapshot(snapshot.sessionId);return current?.revision===snapshot.revision&&current?.contextWindow===snapshot.contextWindow}
 finished(id,revision,userEpoch,result){
  const r=this.saved.threads[id];if(!r||this.records.get(id)?.revision!==revision)return;
  if(['ready','abstained','failed'].includes(result?.status)){
   if(r.userEpoch===userEpoch)r.fulfilledEpoch=r.activeEpoch??r.userEpoch??0;
   r.retroGrant=false;r.remapPending=false;r.balanceRecoveryGrant=null;r.activation=null;this.persist();
   if(['QUOTA','BALANCE_PAUSED'].includes(result.reason)&&r.events?.at(-1)?.code==='balance-paused'){this.signal(id);return;}
   this.notify(id,result.status==='abstained'?'abstained':result.status==='failed'?'generation-error':'prediction-ready',{reason:result.reason??null});
  }else if(result?.reason)this.notify(id,result.reason==='stale'?'stale-response-discarded':result.reason);
 }
 remap(id,reason='context-changed'){const r=this.saved.threads[id]??={};if(r.lastUserSentAt!==undefined)r.remapPending=true;this.markDirty(id,reason)}
 consume(id,revision){if(this.records.get(id)?.revision!==revision)return false;this.saved.threads[id].consumedRevision=revision;this.persist();this.notify(id,'accepted');return true}
 tick(id){if(id&&this.config.watchdogEnabled&&this.watchdog.due(id,this.records.get(id)?.mapping.tokens??0))return this.inspect(id,{force:true})}
 close(){this.closed=true;for(const set of this.listeners.values())for(const fn of [...set])fn();this.listeners.clear();this.views.clear();this.records.clear();this.main.clear()}
}
