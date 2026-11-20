import {RecoverySelector} from './recovery-selector.mjs';

import { createHash, randomUUID } from 'node:crypto';
import { normalizeUsage, quotePrice, priceUsage } from './billing.mjs';
import { profileCacheScope } from './profiles.mjs';
import {POLICY_DEFAULTS,POLICY_KEYS,validatePolicy,parsePrediction,checkPrediction,languageContext,priceAtoms,priceEvidence} from './policy.mjs';
import {DEFAULT_PROMPT,RESULT_SCHEMA,wrapPrompt,composePrompt,repairPrompt,repairSnapshot,repairProfile,classifyFailure,retryDelay,abortableDelay} from './recovery.mjs';
import {resolveCounter,selectedTokenizer} from './token-counter.mjs';
export {DEFAULT_PROMPT,RESULT_SCHEMA,wrapPrompt};
const digest = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clone = x => JSON.parse(JSON.stringify(x));
export function parseSuggestion(text){return parsePrediction(text).suggestion}
export function inputEligible(input={}) {
 return input.draft==='' && (!input.attachmentIds || input.attachmentIds.length===0) && (!input.occurrences || input.occurrences.length===0) && (!input.queue || input.queue.length===0) && (!input.phase||input.phase==='plain');
}
export function acceptKey(event, input, {menuOpen=false,paragraphCount=1}={}) {
 return ['Tab','ArrowRight','Enter'].includes(event.key)&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229&&!event.repeat&&!menuOpen&&paragraphCount===1&&inputEligible(input);
}
export class PredictionEngine {
 constructor({prepareReasoning=async({profile,snapshot})=>({profile,snapshot}),balanceWatchdog,enforceBilling=false,profiles,ledger,run,parentRun,costGate,counterFor=resolveCounter,delay=abortableDelay,audit=async()=>{},now=()=>Date.now(),config={},quoteForParent=()=>null,validateSnapshot=()=>true,validateSnapshotAsync=null,onEvent=()=>{},onAttempt=()=>{},resultCache=null}) {
  Object.assign(this,{prepareReasoning,balanceWatchdog,enforceBilling,profiles,ledger,run,parentRun,costGate,quoteForParent,validateSnapshot,validateSnapshotAsync,onEvent,onAttempt,resultCache,counterFor,delay,audit,now});
  this.config={enabled:false,prompt:DEFAULT_PROMPT,promptVersion:'dsh-local-boundaries-v2',timeoutMs:30000,liveSampleRate:1,catchUpSampleRate:1,maxSessions:64,...POLICY_DEFAULTS,...config};
  this.configure(Object.fromEntries(['enabled','prompt','promptVersion','timeoutMs','liveSampleRate','catchUpSampleRate',...POLICY_KEYS].map(k=>[k,this.config[k]])),{validateOnly:true});
  this.recoverySelector=new RecoverySelector({now,quoteForParent});this.epoch=0;this.snapshots=new Map();this.jobs=new Map();this.results=new Map();this.manualOutcomes=new Map();this.failureDrafts=new Map();this.disposed=false;
 }
 capture(snapshot) {
  if(!snapshot.sessionId||snapshot.turnId==null) throw new Error('snapshot identity required');
  const previous=this.snapshots.get(snapshot.sessionId);
  if(previous&&previous.revision===snapshot.revision&&previous.contextWindow===snapshot.contextWindow&&digest(previous.options)===digest(snapshot.options)&&previous.contextNote===snapshot.contextNote)return previous;
  const copy=clone(snapshot);
  copy.revision=copy.revision??digest(copy);
  this.cancel(copy.sessionId,'parent_changed');this.results.delete(copy.sessionId);
  this.snapshots.delete(copy.sessionId);this.snapshots.set(copy.sessionId,copy);
  while(this.snapshots.size>this.config.maxSessions){const id=[...this.snapshots.keys()].find(id=>id!==copy.sessionId&&!this.jobs.has(id));if(!id)break;this.invalidate(id)}
  return copy;
 }
 storeResult(id,key,reply){
  reply.sourceSessionId=id;this.results.set(id,reply);
  try{this.resultCache?.set(key,reply);this.cachePersistenceError=null}
  catch(error){this.cachePersistenceError=String(error.code??'CACHE_WRITE');reply.cachePersistence='memory-only';}
 }
 invalidate(id){this.cancel(id,'parent_changed');this.snapshots.delete(id);this.results.delete(id)}
 cancel(id,reason='cancelled'){const job=this.jobs.get(id);job?.controller.abort(Object.assign(new Error(reason),{code:'CANCELLED'}));this.results.delete(id)}
 configure(next,{validateOnly=false}={}){
  const allowed=['enabled','prompt','promptVersion','timeoutMs','liveSampleRate','catchUpSampleRate',...POLICY_KEYS];
  validatePolicy(next);
  if(Object.keys(next).some(k=>!allowed.includes(k)))throw new Error('unknown setting');
  if(next.prompt!==undefined&&(typeof next.prompt!=='string'||!next.prompt.trim()||Buffer.byteLength(wrapPrompt(next.prompt))>4000))throw new Error('prompt exceeds native 4000 byte limit');
  if(next.promptVersion!==undefined&&(typeof next.promptVersion!=='string'||!next.promptVersion.trim()||next.promptVersion.length>256))throw new Error('invalid prompt version');
  if(next.enabled!==undefined&&typeof next.enabled!=='boolean')throw new Error('enabled must be boolean');
  for(const k of ['liveSampleRate','catchUpSampleRate'])if(next[k]!==undefined&&(!Number.isFinite(next[k])||next[k]<0||next[k]>1))throw new Error('invalid sample rate');
  if(next.timeoutMs!==undefined&&(!Number.isInteger(next.timeoutMs)||next.timeoutMs<1||next.timeoutMs>30000))throw new Error('invalid timeout');
  if(validateOnly)return;this.config={...this.config,...next};this.changed();return this.settings();
 }
 changed(){this.recoverySelector?.clear();this.epoch++;for(const id of this.jobs.keys())this.cancel(id,'configuration_changed');this.results.clear();this.manualOutcomes.clear();this.failureDrafts.clear()}
 settings(){return {enabled:this.config.enabled,prompt:this.config.prompt,promptVersion:this.config.promptVersion,timeoutMs:this.config.timeoutMs,liveSampleRate:this.config.liveSampleRate,catchUpSampleRate:this.config.catchUpSampleRate,...Object.fromEntries(POLICY_KEYS.map(k=>[k,this.config[k]])),profile:this.profiles.publicCurrent?.()??null,promptParity:this.config.promptVersion.startsWith('dsh-')?'reconstructed':'user-supplied-unverified'}}
 state(id){const s=this.snapshots.get(id);return {sessionId:id,turnId:s?.turnId??null,revision:s?.revision??null,available:!!s&&s.eligible!==false,loading:this.jobs.has(id),result:this.results.get(id)??null,settings:this.settings()}}
 identity(snapshot){
  const profile=this.profiles.current?.()??null;
  const epoch=this.epoch,basePrompt=this.config.prompt+(snapshot.contextNote?'\n\n'+snapshot.contextNote:''),prompt=composePrompt({base:basePrompt,policy:this.config,language:languageContext(snapshot,this.config),instruction:snapshot.instructionText??'',counterUnit:selectedTokenizer(profile,snapshot)==='utf8-upper-bound'?'UTF-8 bytes (conservative token proxy)':'tokens'}),scope=profile?profileCacheScope(profile,snapshot.parentConfig??{}):'parent:'+digest(snapshot.parentConfig??{});
  const cacheConfig={...this.config};if(cacheConfig.reasoningMode==='minimum')delete cacheConfig.reasoningMode; // Preserve beta2 minimum results without another paid generation.
  const key=digest({cacheSchema:3,scope,revision:snapshot.revision,turn:snapshot.turnId,config:cacheConfig});
  return {profile,epoch,prompt,scope,key};
 }
 peek(id){const snapshot=this.snapshots.get(id);if(!snapshot||!this.validateSnapshot(snapshot))return null;const {key}=this.identity(snapshot);let cached=this.results.get(id)??this.resultCache?.get(key);if(cached?.key!==key)return null;if(typeof cached.suggestion==='string'&&priceAtoms(cached.suggestion).some(x=>!priceEvidence(snapshot).includes(x))){this.failureDrafts.set(key,{raw:cached.suggestion,issues:['UNSUPPORTED_PRICE_ASSUMPTION'],tokens:cached.validation?.tokens??Buffer.byteLength(cached.suggestion)});cached={...cached,suggestion:null,status:'failed',reason:'VALIDATION_FAILED',issues:['UNSUPPORTED_PRICE_ASSUMPTION'],canRetry:true,cachedValidationRejected:true};this.onEvent('cached-validation-rejected',snapshot,{issues:cached.issues});}this.results.set(id,cached);return cached;}
 async sample({sessionId,expectedTurnId,trigger='live',signal,leaseId,requestId,allowDispatch=true}){
  const snapshot=this.snapshots.get(sessionId);
  if(signal?.aborted)return {suggestion:null,reason:'CANCELLED'};
  if(this.disposed||!this.config.enabled||!snapshot||snapshot.eligible===false||snapshot.turnId!==expectedTurnId)return {suggestion:null,reason:'ineligible'};
  if(!['live','catch_up','manual_retry'].includes(trigger))throw new Error('invalid prediction trigger');
  const {profile,epoch,prompt,scope,key}=this.identity(snapshot);
  const manualKey=trigger==='manual_retry'&&requestId?key+'#'+requestId:null;
  if(manualKey&&this.manualOutcomes.has(manualKey))return this.manualOutcomes.get(manualKey);
  if(!this.validateSnapshot(snapshot))return {suggestion:null,reason:'stale',canRetry:false};
  const cached=this.peek(sessionId);
  if(cached?.key===key)this.results.set(sessionId,cached);if(cached?.key===key&&trigger!=='manual_retry')return cached;
  if(trigger==='manual_retry'&&cached?.key===key&&!cached.canRetry)return cached;
  const active=this.jobs.get(sessionId);if(active?.key===key&&!active.controller.signal.aborted){const joined=this.subscribe(active,signal,leaseId);return manualKey?joined.then(value=>{if(this.epoch===epoch){this.manualOutcomes.set(manualKey,value);while(this.manualOutcomes.size>256)this.manualOutcomes.delete(this.manualOutcomes.keys().next().value)}return value}):joined;}
  if(!allowDispatch&&trigger!=='manual_retry')return {suggestion:null,reason:'cache-only',canRetry:false,revision:snapshot.revision};
  if(active){this.cancel(sessionId,'replaced');await active.promise.catch(()=>{})}
  if(this.epoch!==epoch||this.snapshots.get(sessionId)!==snapshot)return {suggestion:null,reason:'stale'};
  const rate=trigger==='manual_retry'?1:trigger==='live'?this.config.liveSampleRate:this.config.catchUpSampleRate;
  // Stable sampling avoids rerolling until the same turn eventually dispatches.
  if(parseInt(key.slice(0,8),16)/0x100000000>=rate)return {suggestion:null,reason:'sampled_out'};
  const controller=new AbortController(),token={key,controller,consumers:new Set()};this.jobs.set(sessionId,token);
  const timer=setTimeout(()=>controller.abort(Object.assign(new Error('sample timeout'),{code:'TIMEOUT'})),Math.min(180000,this.config.timeoutMs*(1+(this.config.automaticRetry?this.config.networkRetryLimit+this.config.validationRepairLimit:0))+this.config.retryMaxDelayMs*this.config.networkRetryLimit));
  token.promise=this.perform({profile,snapshot,prompt,scope,key,epoch,trigger,controller,manualDraft:trigger==='manual_retry'?this.failureDrafts.get(key):null}).then(value=>{if(manualKey&&this.epoch===epoch){this.manualOutcomes.set(manualKey,value);while(this.manualOutcomes.size>256)this.manualOutcomes.delete(this.manualOutcomes.keys().next().value)}return value}).finally(()=>{clearTimeout(timer);if(this.jobs.get(sessionId)===token)this.jobs.delete(sessionId)});
  return this.subscribe(token,signal,leaseId);
 }
 subscribe(job,signal,leaseId){
  const consumer={leaseId};job.consumers.add(consumer);
  let finishAbort;
  const cancelled=new Promise(resolve=>{finishAbort=()=>resolve({suggestion:null,reason:'CANCELLED'})});
  consumer.cancel=()=>{job.consumers.delete(consumer);finishAbort();if(job.consumers.size===0)job.controller.abort(Object.assign(new Error('no consumers'),{code:'CANCELLED'}))};
  signal?.addEventListener('abort',consumer.cancel,{once:true});if(signal?.aborted)consumer.cancel();
  return Promise.race([job.promise,cancelled]).finally(()=>{signal?.removeEventListener('abort',consumer.cancel);job.consumers.delete(consumer)});
 }
 cancelConsumer(sessionId,leaseId){
  const job=this.jobs.get(sessionId);
  if(!job)return {cancelled:false};
  if(leaseId===undefined){for(const c of [...job.consumers])c.cancel();return {cancelled:true}}
  let found=false;for(const c of [...job.consumers])if(c.leaseId===leaseId){found=true;c.cancel()}
  return {cancelled:found};
 }

 async evaluate(result,context){
  if(result.toolCalled)throw Object.assign(Error('Tool output is not a user prediction'),{code:'NON_TEXT_SAMPLE'});
  let parsed;try{parsed=parsePrediction(result.text??'')}catch(error){throw Object.assign(error,{validation:true,raw:result.text??'',issues:['INVALID_JSON'],tokens:await context.counter.count(result.text??'')})}
  if(parsed.abstained)return {suggestion:null,abstained:true};
  const check=await checkPrediction(parsed.suggestion,context);
  if(['max_tokens','length'].includes(result.finishReason))check.issues.push('PROVIDER_TRUNCATED');
  if(check.issues.length)throw Object.assign(Error('Local validation failed'),{code:'VALIDATION_FAILED',validation:true,raw:parsed.suggestion,issues:check.issues,tokens:check.tokens,counter:check.counter});
  return {suggestion:check.text,validation:check};
 }
 async invokeAttempt({profile,snapshot,sourceSnapshot=snapshot,prompt,scope,trigger,jobSignal,credential,stage,number,groupId,evaluate,decision}){
  if(this.validateSnapshotAsync&&!await this.validateSnapshotAsync(sourceSnapshot))throw Object.assign(Error('Source changed before request'),{code:'STALE_SOURCE'});
  if(!this.validateSnapshot(sourceSnapshot))throw Object.assign(Error('Source changed before request'),{code:'STALE_SOURCE'});
  const id=randomUUID(),startedAt=new Date(this.now()).toISOString(),quote=profile?quotePrice(profile,startedAt):this.quoteForParent(snapshot,startedAt);
  if(this.enforceBilling){
   const valid=quote?.status==='priced'&&quote.certainty==='exact'&&typeof quote.currency==='string'&&/^[A-Z]{3}$/.test(quote.currency)&&typeof quote.versionId==='string'&&!!quote.versionId&&['input','cacheRead','output'].every(k=>Number.isFinite(quote.rates?.[k])&&quote.rates[k]>=0);
   if(!valid||profile?.protocol==='anthropic-messages'&&profile.cache?.control&&!Number.isFinite(quote.rates?.cacheWrite)){this.onEvent('price-unavailable',snapshot,{});throw Object.assign(Error('Prediction requires a known price before dispatch'),{code:'PRICE_UNAVAILABLE',notDispatched:true})}
   if(this.ledger.list({sourceSessionId:snapshot.sessionId,limit:100000}).some(e=>e.cost.status==='unpriced')||(this.ledger.pending?.()??[]).some(e=>e.sourceSessionId===snapshot.sessionId)){this.onEvent('billing-unreconciled',snapshot,{});throw Object.assign(Error('Prior prediction usage is unreconciled'),{code:'BILLING_UNRECONCILED',notDispatched:true})}
  }
  try{await this.balanceWatchdog?.before({profile,snapshot,trigger})}catch(error){error.notDispatched=true;throw error}
  const timeout=new AbortController(),signal=AbortSignal.any([jobSignal,timeout.signal]);
  const timer=setTimeout(()=>timeout.abort(Object.assign(Error('Physical request timeout'),{code:'TIMEOUT'})),this.config.timeoutMs);
  let usage=normalizeUsage(profile?.protocol??'responses',null),status='failed',errorCode,reservation,begun=false,dispatched=false,settled=false,transportResult;
  const entry={id,groupId,stage,attemptNumber:String(number),profileId:profile?.id??'parent',scopeKey:scope,protocol:profile?.protocol??'parent',model:profile?.model??snapshot.options.model,startedAt,sourceSessionId:snapshot.sessionId,sourceTurnId:String(snapshot.turnId),sourceRevision:snapshot.revision,reasoningPolicy:JSON.stringify(snapshot.reasoningDecision??null),contextPlan:snapshot.contextPlan??null,trigger,...decision?{recoveryDecision:decision}:{},billingSource:profile?.protocol==='codex-native'?'native-subscription':profile?'api':'parent-provider-unverified',quote};
  try{
   signal.throwIfAborted();
   if(this.costGate){
    reservation=this.costGate.reserve({id,scopeKey:scope,quote,inputTokenUpperBound:stage==='repair'&&(!decision||decision.strategy==='draft-only')?Math.min(profile?.request?.defaultContextWindow??snapshot.contextWindow??1048576,Buffer.byteLength(prompt)+4096):profile?.request?.defaultContextWindow??snapshot.contextWindow,outputTokenUpperBound:profile?.request?.maxTokens??profile?.request?.max_output_tokens??snapshot.options.maxTokens,cacheWriteMayOccur:profile?.protocol==='responses'||profile?.protocol==='anthropic-messages'});
    if(!reservation.allowed)throw Object.assign(Error('Cost gate refused'),{code:reservation.reason});
   }
   await this.audit({id,groupId,stage,attemptNumber:number,sessionId:snapshot.sessionId,turnId:snapshot.turnId,revision:snapshot.revision,promptVersion:this.config.promptVersion,...decision?{recoveryDecision:decision}:{},prompt,request:snapshot.options,scope,startedAt});
   signal.throwIfAborted();if(this.validateSnapshotAsync&&!await this.validateSnapshotAsync(sourceSnapshot))throw Object.assign(Error('Source changed before dispatch'),{code:'STALE_SOURCE'});if(!this.validateSnapshot(sourceSnapshot))throw Object.assign(Error('Source changed before dispatch'),{code:'STALE_SOURCE'});await this.ledger.begin(entry);begun=true;
   if(!this.validateSnapshot(sourceSnapshot))throw Object.assign(Error('Source changed at dispatch'),{code:'STALE_SOURCE'});
   const run=profile?this.run:this.parentRun;if(!run)throw Object.assign(Error('Backend unavailable'),{code:'NO_BACKEND'});
   this.onEvent(stage==='repair'?'validation-repair':'prediction-request',snapshot,{number,stage});
   let aborted;const cancelled=new Promise((_,reject)=>{aborted=()=>reject(signal.reason??Object.assign(Error('Cancelled'),{code:'CANCELLED'}));signal.addEventListener('abort',aborted,{once:true})});
   try{signal.throwIfAborted();dispatched=true;transportResult=await Promise.race([run(profile,snapshot,prompt,{signal,credential,onUsage:x=>{if(!settled)usage=x},stage}),cancelled])}finally{signal.removeEventListener('abort',aborted)}
   if(transportResult.usage)usage=transportResult.usage;signal.throwIfAborted();
   if(this.validateSnapshotAsync&&!await this.validateSnapshotAsync(sourceSnapshot))throw Object.assign(Error('Source changed after response'),{code:'STALE_SOURCE'});
   if(this.enforceBilling&&priceUsage(usage,quote).status==='unpriced'){throw Object.assign(Error('Provider did not return complete usage; automatic retries stopped'),{code:'BILLING_UNRECONCILED'})}
   try{this.balanceWatchdog?.succeeded({profile,snapshot})}catch{this.onEvent('balance-query-failed',snapshot,{})}
   const value=await evaluate(transportResult);signal.throwIfAborted();status='completed';return {...value,requestMode:transportResult.requestMode,...transportResult.migration?{migration:transportResult.migration}:{}};
  }catch(error){
   if(error.notDispatched===true)dispatched=false;
   if(!dispatched)error.notDispatched=true;
   if(error?.code==='QUOTA'&&(error.quotaExplicit||error.status===402)){try{this.balanceWatchdog?.rejected({profile,snapshot,trigger})}catch{this.onEvent('balance-query-failed',snapshot,{})}}
   if(error?.status===402&&error?.code==='QUOTA'&&usage.status==='unknown'&&error.generationObserved!==true){entry.billingDisposition='provider-rejected-402';entry.rejectionEvidence={httpStatus:402,code:'QUOTA',streamHadGeneration:false};}
   if(error?.preGenerationRejection&&usage.status==='unknown'&&!entry.billingDisposition){entry.billingDisposition='provider-rejected-http';entry.rejectionEvidence={httpStatus:error.status,code:String(error.code),streamHadGeneration:false,preGenerationRejection:true};}
   if(this.enforceBilling&&dispatched&&priceUsage(usage,quote).status==='unpriced'&&!entry.billingDisposition){this.onEvent('billing-unreconciled',snapshot,{});error=Object.assign(Error('Dispatched request has unresolved usage; no automatic retry'),{code:'BILLING_UNRECONCILED'})}
   else if(signal.aborted)error=signal.reason??error;
   status=jobSignal.aborted?'cancelled':'failed';errorCode=String(error.code??'SAMPLE_FAILED');if(error.validation){error.attemptUsage=usage;error.attemptAt=this.now()}throw error;
  }finally{
   if(transportResult)this.onAttempt(sourceSnapshot,usage);
   if(transportResult)this.recoverySelector.observe({profile,snapshot,prompt,scope,usage,finishedAt:this.now()});settled=true;clearTimeout(timer);timeout.abort();
   if(begun&&!dispatched){entry.billingDisposition='not-dispatched';entry.noDispatchEvidence={noProviderInvocation:true};}
   if(begun){await this.ledger.record({...entry,finishedAt:new Date(this.now()).toISOString(),status,usage,...errorCode?{errorCode}:{}});this.costGate?.release(id,{settled:true})}
   else if(reservation?.reservation)this.costGate?.release(id,{notDispatched:true});
  }
 }
 async perform({profile,snapshot,prompt,scope,key,epoch,trigger,controller,manualDraft}){
  const sourceSnapshot=snapshot;
  const policy={...POLICY_DEFAULTS,...this.config},groupId=randomUUID(),recovery={networkRetries:0,validationRepairs:0,physicalAttempts:0};
  let stage='prediction',currentSnapshot=snapshot,currentProfile=profile,currentPrompt=prompt,currentDecision,repairInput=manualDraft,primaryUsage=manualDraft?.primaryUsage,primaryAt=manualDraft?.primaryAt,counter,language=languageContext(snapshot,policy),credential;
  const isCurrent=()=>this.epoch===epoch&&this.snapshots.get(sourceSnapshot.sessionId)===sourceSnapshot&&!controller.signal.aborted&&this.validateSnapshot(sourceSnapshot);
  const failure=(reason,issues=[])=>{
   const reply={key,suggestion:null,reason,issues,canRetry:!controller.signal.aborted||controller.signal.reason?.code==='TIMEOUT',status:'failed',turnId:snapshot.turnId,revision:snapshot.revision,recovery:{...recovery}};
   if(this.epoch===epoch&&this.snapshots.get(sourceSnapshot.sessionId)===sourceSnapshot&&(!controller.signal.aborted||controller.signal.reason?.code==='TIMEOUT')){this.storeResult(snapshot.sessionId,key,reply);}return reply;
  };
  try{
   const prepared=await this.prepareReasoning({profile,snapshot,mode:this.config.reasoningMode,signal:controller.signal});
   profile=prepared.profile;snapshot=prepared.snapshot;currentSnapshot=snapshot;currentProfile=profile;
   scope+=':reasoning:'+digest(prepared.decision??null);
   credential=profile?await this.profiles.resolveCredential(profile):undefined;controller.signal.throwIfAborted();
   counter=await this.counterFor(profile,snapshot);
   if(manualDraft){
    stage='repair';recovery.validationRepairs=1;recovery.manualRepair=true;
   }
   while(true){
    controller.signal.throwIfAborted();if(!isCurrent())return {suggestion:null,reason:'stale',canRetry:false};
    if(stage==='repair'){
     const selected=this.recoverySelector.plan({profile,snapshot,originalPrompt:prompt,...repairInput,policy,language,counter,scope,primaryUsage,primaryAt});
     currentPrompt=selected.prompt;currentSnapshot=selected.snapshot;currentProfile=selected.profile;currentDecision=selected.decision;recovery.selection=currentDecision;
    }
    const number=++recovery.physicalAttempts;
    try{
     const value=await this.invokeAttempt({profile:currentProfile,snapshot:currentSnapshot,sourceSnapshot,prompt:currentPrompt,scope,trigger,jobSignal:controller.signal,credential,stage,number,groupId,decision:currentDecision,evaluate:result=>this.evaluate(result,{policy,language,counter,snapshot})});
     if(!isCurrent()){this.onEvent('stale-response-discarded',snapshot,{});return {suggestion:null,reason:'stale',canRetry:false};}
     this.failureDrafts.delete(key);
     const reply={key,...value,status:value.abstained?'abstained':'ready',canRetry:false,turnId:snapshot.turnId,revision:snapshot.revision,profileId:profile?.id??'parent',promptVersion:this.config.promptVersion,recovery:{...recovery}};
     this.storeResult(snapshot.sessionId,key,reply);try{this.balanceWatchdog?.succeeded({profile,snapshot})}catch{this.onEvent('balance-query-failed',snapshot,{})}return reply;
    }catch(error){
     if(error.notDispatched)recovery.physicalAttempts--;
     if(controller.signal.aborted)throw error;
     if(stage==='prediction'&&error.attemptUsage){primaryUsage=error.attemptUsage;primaryAt=error.attemptAt}
     if(error.validation&&typeof error.raw==='string'&&Buffer.byteLength(error.raw)<=65536){
      this.failureDrafts.set(key,{raw:error.raw,issues:error.issues,tokens:error.tokens,primaryUsage,primaryAt});
      while(this.failureDrafts.size>256)this.failureDrafts.delete(this.failureDrafts.keys().next().value);
     }
     if(error.validation&&policy.automaticRetry&&recovery.validationRepairs<policy.validationRepairLimit){
      repairInput={raw:error.raw,issues:error.issues,tokens:error.tokens};stage='repair';recovery.validationRepairs++;continue;
     }
     if(classifyFailure(error)==='network'&&policy.automaticRetry&&recovery.networkRetries<policy.networkRetryLimit){
      const wait=retryDelay(recovery.networkRetries,policy,error);recovery.networkRetries++;this.onEvent('network-retry',snapshot,{retry:recovery.networkRetries});await this.delay(wait,controller.signal);continue;
     }
     return failure(error.code??'SAMPLE_FAILED',error.issues);
    }
   }
  }catch(error){return failure(controller.signal.aborted?(controller.signal.reason?.code??'CANCELLED'):(error.code??'SAMPLE_FAILED'),error.issues)}
 }
 async dispose(){this.disposed=true;this.changed();await Promise.allSettled([...this.jobs.values()].map(x=>x.promise));this.snapshots.clear();this.results.clear();this.manualOutcomes.clear();this.failureDrafts.clear();await this.ledger.close()}
}
