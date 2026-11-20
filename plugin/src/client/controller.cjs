'use strict';
const {POLICY_FIELDS}=require('./policy-fields.cjs');
const {inputEligible,sessionEligible,acceptanceKey,editorEligible}=require('./guards.cjs');
const {paint,restore,ghostAvailable}=require('./placeholder.cjs');
const {specialEvent}=require('./events.cjs');
const LIFECYCLE_FIELDS=['newThreadsEnabled','watchdogEnabled','balanceWatchdogEnabled','minRetainedCacheRatio','contextTargetTokens','contextQualityCostSlack','retroactiveEnabled','retroactiveHours','retroactiveLimit'];
function observable(value){const listeners=new Set();return {getSnapshot:()=>value,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},publish(next){value=next;for(const fn of [...listeners])fn()}}}
class PredictionClient{
 constructor({rpc,sessions,conversation,connection,document}){
  Object.assign(this,{rpc,sessions,conversation,connection,document});this.entries=new Map();this.threads=new Map();this.closed=false;this.activeEntry=null;this.interaction=0;this.processWatches=new Set();
  this.blacklist=observable({workspaces:[],blockedWorkspaces:[],blockedThreads:[],workspaceLookupAvailable:true,busy:false});
  this.settings=observable({enabled:false,profileFile:'parent',profiles:[],usage:null,error:null,busy:false});
  this.disposeConnection=connection.generation.subscribe(()=>this.invalidate('connection'));
  this.window=document.defaultView;
  this.foregroundEpoch=0;this.windowActive=false;
  this.onForeground=()=>{const changed=!this.windowActive;this.windowActive=true;if(changed)this.foregroundEpoch++;for(const entry of this.entries.values())if(entry.mounts.size){this.update(entry,'catch_up',{interacted:true});if(changed)void this.call('checkBalance',{sessionId:entry.sessionId,checkpoint:entry.leaseId+':foreground:'+this.foregroundEpoch,force:false}).catch(()=>{})}};
  this.onWindowBlur=()=>{this.windowActive=false};this.window?.addEventListener('blur',this.onWindowBlur);
  this.onBackground=()=>{this.windowActive=false;for(const entry of this.entries.values())this.deactivate(entry,'background')};
  this.onVisibility=()=>document.visibilityState==='hidden'?this.onBackground():this.onForeground();
  document.addEventListener('visibilitychange',this.onVisibility);this.window?.addEventListener('focus',this.onForeground);
 }
 async call(method,payload={},signal){const r=await this.rpc.call('/composer-prediction',method,payload,signal);if(!r.ok){const e=Error(r.error.message);e.code=r.error.code;throw e}return r.value}
 entry(id){
  let e=this.entries.get(id);if(!e){e={sessionId:id,source:observable({suggestion:null,status:'idle',error:null}),mounts:new Set(),generation:0,lastAttempt:null,inflight:null,leaseId:globalThis.crypto.randomUUID(),sequence:0,wasRunning:false};this.entries.set(id,e);}
  return e;
 }
 sourceFor(id){return this.entry(id).source}
 set(e,patch){e.source.publish({...e.source.getSnapshot(),...patch});for(const m of e.mounts)paint(m,this.canUse(e,m)&&typeof e.source.getSnapshot().suggestion==='string',e.source.getSnapshot().suggestion)}
 foreground(m){
  return !this.closed&&this.document.visibilityState!=='hidden'&&m.node.isConnected!==false&&m.editor?.isConnected!==false&&
   !m.card.closest?.('[hidden],[aria-hidden="true"]')&&(!m.card.getClientRects||m.card.getClientRects().length>0);
 }
 canUse(e,m){return ghostAvailable(m)&&e.hostState?.enabled!==false&&e.hostState?.threadEnabled!==false&&this.activeEntry===e&&e.activeMount===m&&this.foreground(m)&&!m.composing&&inputEligible(m.input.state.getSnapshot())&&sessionEligible(m.binding.session.getSnapshot())&&editorEligible(m.editor,m.card)}
 ready(e){return [...e.mounts].some(m=>this.canUse(e,m))}
 hide(e,reason){e.generation++;e.inflight?.abort(reason);e.inflight=null;e.accepting=false;this.set(e,{suggestion:null,status:'idle',error:null,canRetry:false});void this.call('cancel',{sessionId:e.sessionId,leaseId:e.leaseId}).catch(()=>{})}
 cancel(e,reason){this.hide(e,reason)}
 async observe(e,{active=true,force=false,signal}={}){
  const ready=this.ready(e);
  const value=await this.call('observe',{sessionId:e.sessionId,leaseId:e.leaseId,sequence:++e.sequence,interaction:e.interaction??0,active,ready,force},signal);
  if(value?.observation?.accepted===false)return null;
  return value?{...value,observedReady:ready}:value;
 }
 deactivate(e,reason){
  e.watchAbort?.abort();e.watchAbort=null;this.hide(e,reason);
  if(this.activeEntry===e)this.activeEntry=null;
  void this.observe(e,{active:false}).catch(()=>{});
 }
 update(e,trigger='catch_up',{interacted=false}={}){
  if(this.closed||!e.mounts.size)return;
  const visibleMounts=[...e.mounts].filter(m=>this.foreground(m)),visible=visibleMounts.length>0;
  if(!visibleMounts.includes(e.activeMount))e.activeMount=visibleMounts[0];
  if(!visible){if(this.activeEntry===e)this.deactivate(e,'inactive');return;}
  if(this.activeEntry!==e){
   if(this.activeEntry)this.deactivate(this.activeEntry,'session-switch');
   this.activeEntry=e;e.interaction=++this.interaction;interacted=true;
  }
  if(interacted)e.interaction=++this.interaction;
  const running=[...e.mounts].some(m=>m.binding.session.getSnapshot().running);
  const live=e.wasRunning&&!running;e.wasRunning=running;
  if(live)e.pendingTrigger='live';
  if(!this.ready(e))this.hide(e,'composer-unavailable');
  void this.refresh(e,live?'live':trigger);
  this.startWatch(e);
 }
 startWatch(e){
  if(e.watchUnsupported||e.watchAbort||this.closed||this.activeEntry!==e||!e.mounts.size)return;
  const abort=new AbortController();e.watchAbort=abort;
  void (async()=>{try{while(!abort.signal.aborted&&this.activeEntry===e&&e.mounts.size){
   const value=await this.call('watch',{sessionId:e.sessionId,afterVersion:e.version??0},abort.signal);
   if(abort.signal.aborted||this.activeEntry!==e)break;
   if(!value||typeof value.version!=='number'){e.watchUnsupported=true;break;}
   e.version=value.version;
   const structural=['user-submitted','assistant-running','context-changed','context-updated','prediction-invalidated','context-compacted','external-editing','cache-prefix-loss','thread-disabled','thread-blacklisted','workspace-blacklisted','blacklist-unavailable','blacklist-removed','configuration-changed'].includes(value.event?.code);
   if(structural)this.hide(e,'source-event');
   if(e.inflight)e.pendingTrigger='catch_up';else void this.refresh(e,'catch_up');
  }}catch(error){if(!abort.signal.aborted)this.set(e,{notice:'connection-error'})}finally{if(e.watchAbort===abort)e.watchAbort=null}})();
 }
 watchProcess(id){
  const e=this.entry(id);let abort,closed=false;
  const start=()=>{abort?.abort();if(closed||this.closed)return;abort=new AbortController();const signal=abort.signal;
   void (async()=>{let version=0;try{while(!signal.aborted){const value=await this.call('watch',{sessionId:id,afterVersion:version},signal);
    if(signal.aborted||!value||typeof value.version!=='number')break;version=value.version;
    const events=[...(e.source.getSnapshot().events??[])];if(value.event&&!events.some(x=>x.id===value.event.id))events.push(value.event);
    this.set(e,{events:events.slice(-32),processVersion:version});
   }}catch{if(!signal.aborted)this.set(e,{notice:'connection-error'})}})();
  };
  const off=this.connection.generation.subscribe(start),dispose=()=>{closed=true;abort?.abort();off();this.processWatches.delete(dispose)};
  this.processWatches.add(dispose);start();return dispose;
 }
 renderDecoration(id,node,text){const e=this.entries.get(id);if(!e)return;const m=[...e.mounts].find(m=>m.node===node);if(m)paint(m,!!text&&this.canUse(e,m),text)}
 bind(sessionId,node,inputActions){
  const e=this.entry(sessionId),card=node.closest('[data-composer-card]'),binding=this.sessions.binding(sessionId);
  if(!card||!binding){this.set(e,{status:'unsupported',error:'editor-contract'});return()=>{}}
  const input=this.conversation.input.for(binding.ctx);
  const m={node,card,binding,input,inputActions,owner:e.leaseId+':'+globalThis.crypto.randomUUID(),editor:null};e.mounts.add(m);e.activeMount=m;
  const update=()=>{m.editor=card.querySelector('[data-composer-input],[contenteditable][role="textbox"],[contenteditable="true"]');this.update(e)};
  const interaction=()=>{e.activeMount=m;e.interaction=++this.interaction;update()};
  const keydown=event=>{
   if(event.target!==m.editor||!acceptanceKey(event)||!this.canUse(e,m))return;
   const suggestion=e.source.getSnapshot().suggestion;
   if(suggestion){event.preventDefault();event.stopPropagation();void this.accept(e,m,suggestion);return;}
   if(event.key==='Tab'&&e.hostState?.enabled!==false&&e.hostState?.threadEnabled!==false&&!e.hostState?.suspended){
    event.preventDefault();event.stopPropagation();
    if(e.source.getSnapshot().canRetry)void this.retry(sessionId);else void this.refresh(e,'catch_up',{force:true});
   }
  };
  const composition=()=>{m.composing=true;this.hide(e,'composition')};
  const compositionEnd=()=>{m.composing=false;update()};
  const beforeinput=()=>this.hide(e,'typing');
  const offInput=input.state.subscribe(update),offSession=binding.session.subscribe(update);
  card.addEventListener('keydown',keydown,true);card.addEventListener('pointerdown',interaction,true);card.addEventListener('focusin',interaction);
  card.addEventListener('compositionstart',composition,true);card.addEventListener('compositionend',compositionEnd,true);card.addEventListener('beforeinput',beforeinput,true);
  const Observer=this.window?.MutationObserver;
  const observer=Observer?new Observer(records=>{if(records.every(r=>r.attributeName==='style')&&(!m.ghost||m.editor.style.getPropertyValue('--dsh-composer-hint')===m.ghost.appliedValue))return;update()}):null;
  observer?.observe(card,{subtree:true,childList:true,attributes:true,attributeFilter:['contenteditable','aria-disabled','aria-expanded','data-composer-composing','style']});
  const Resize=this.window?.ResizeObserver;const resize=Resize?new Resize(()=>this.set(e,{})):null;resize?.observe(card);
  update();
  return()=>{
   offInput();offSession();observer?.disconnect();resize?.disconnect();restore(m);
   card.removeEventListener('keydown',keydown,true);card.removeEventListener('pointerdown',interaction,true);card.removeEventListener('focusin',interaction);
   card.removeEventListener('compositionstart',composition,true);card.removeEventListener('compositionend',compositionEnd,true);card.removeEventListener('beforeinput',beforeinput,true);
   e.mounts.delete(m);if(e.activeMount===m)e.activeMount=[...e.mounts][0];if(!e.mounts.size){this.deactivate(e,'unmounted');e.lastAttempt=null;}
   for(const [id,old] of this.entries)if(this.entries.size>64&&!old.mounts.size)this.entries.delete(id);
  };
 }
 async refresh(e,trigger,{force=false}={}){
  if(this.closed||e.inflight||!e.mounts.size||this.activeEntry!==e)return;
  const generation=e.generation,abort=new AbortController();e.inflight=abort;
  try{
   const state=await this.observe(e,{force,signal:abort.signal});
   if(!state||generation!==e.generation||abort.signal.aborted||this.activeEntry!==e)return;
   if(state.observedReady!==this.ready(e)){e.pendingTrigger=e.pendingTrigger??trigger;return;}
   e.hostState=state;e.version=state.version??e.version??0;
   const eventFields={events:state.events??[],processVersion:state.version??0,notice:state.events?.at(-1)?.code??null};
   this.settings.publish({...this.settings.getSnapshot(),enabled:state.enabled,...state.profileFile===undefined?{}:{profileFile:state.profileFile}});
   const identity=JSON.stringify([state.expectedTurnId,state.revision,state.configVersion]);
   const displayed=e.source.getSnapshot().identity;
   if(displayed&&displayed!==identity)this.set(e,{suggestion:null,status:'idle',error:null,canRetry:false,identity:null});
   if(!state.enabled||state.blacklisted||state.threadEnabled===false||state.suspended||!state.eligible||!this.ready(e)){
    this.set(e,{...eventFields,suggestion:null,status:state.suspended?'suspended':'idle',error:state.suspended??null,canRetry:false});return;
   }
   const expectedTurnId=state.expectedTurnId??state.latestTurnId,expectedRevision=state.revision;
   if(expectedTurnId==null||expectedRevision==null)return;
   if(!force&&(state.consumedRevision===expectedRevision||e.consumedIdentity===identity)){this.set(e,{...eventFields});return;}
   if(state.cachedResult&&!(trigger==='manual_retry'&&state.cachedResult.canRetry)){const result=state.cachedResult;const completed={...eventFields,status:result.canRetry?'error':result.abstained?'abstained':'idle',canRetry:!!result.canRetry,error:result.reason??null,issues:result.issues??[],sourceTurnId:expectedTurnId,sourceRevision:expectedRevision,sourceConfigVersion:state.configVersion,identity,suggestion:typeof result.suggestion==='string'?result.suggestion:null};e.cached=completed;e.lastAttempt=identity;this.set(e,completed);return;}
   if(state.canGenerate===false&&trigger!=='manual_retry'){this.set(e,{...eventFields,status:'idle',suggestion:null,canRetry:false});return;}
   if(!force&&e.lastAttempt===identity){if(e.cached?.identity===identity)this.set(e,{...e.cached,...eventFields});return;}
   e.lastAttempt=identity;this.set(e,{status:'loading',suggestion:null,error:null,canRetry:false,identity});
   const result=await this.call('sample',{sessionId:e.sessionId,expectedTurnId,expectedRevision,trigger,leaseId:e.leaseId,...trigger==='manual_retry'?{requestId:e.manualRequestId}:{}},abort.signal);
   if(generation!==e.generation||abort.signal.aborted||!this.ready(e)||this.activeEntry!==e)return;
   // A successful RPC still cannot move a suggestion across source generations.
   if(result?.revision!==undefined&&result.revision!==expectedRevision){this.set(e,{suggestion:null,status:'idle',identity:null});return;}
   const suggestion=typeof result==='string'?result:result?.suggestion;
   const completed={...eventFields,status:result?.canRetry?'error':'idle',canRetry:!!result?.canRetry,error:result?.canRetry?result.reason:null,recovery:result?.recovery,issues:result?.issues??[],
    sourceTurnId:expectedTurnId,sourceRevision:expectedRevision,sourceConfigVersion:state.configVersion,identity,suggestion:typeof suggestion==='string'&&suggestion.trim()?suggestion.trim():null};e.cached=completed;this.set(e,completed);
  }catch(error){if(generation===e.generation&&!abort.signal.aborted)this.set(e,{status:'error',suggestion:null,canRetry:true,error:error.code??'request'})}
  finally{if(e.inflight===abort){e.inflight=null;if(e.source.getSnapshot().status==='loading')this.set(e,{status:'idle'});const next=e.pendingTrigger;e.pendingTrigger=null;if(next&&this.activeEntry===e&&e.mounts.size)void this.refresh(e,next);}}
 }
 async accept(e,m,suggestion){
  if(e.accepting||!this.canUse(e,m))return false;
  const source=e.source.getSnapshot(),span=m.inputActions.captureInsertion(),generation=e.generation;
  if(span.start!==0||span.end!==0||span.draftRev!==m.input.state.getSnapshot().draftRev)return false;
  e.accepting=true;this.set(e,{suggestion:null,status:'checking'});
  try{
   const checked=await this.call('accept',{sessionId:e.sessionId,expectedTurnId:source.sourceTurnId,expectedRevision:source.sourceRevision,expectedConfigVersion:source.sourceConfigVersion,leaseId:e.leaseId});
   if(!checked?.valid||generation!==e.generation||!this.canUse(e,m)||span.draftRev!==m.input.state.getSnapshot().draftRev){e.cached=null;this.set(e,{suggestion:null,status:'idle',identity:null});return false;}
   if(!m.inputActions.insertText(suggestion,span))return false;
   e.consumedIdentity=source.identity;m.inputActions.persistDraft();this.hide(e,'accepted');return true;
  }catch{this.set(e,{suggestion:null,status:'idle',error:'source-validation'});return false}
  finally{e.accepting=false;}
 }
 async retry(id){const e=this.entries.get(id);if(!e?.source.getSnapshot().canRetry||e.inflight||!this.ready(e))return;e.manualRequestId=globalThis.crypto.randomUUID();return this.refresh(e,'manual_retry',{force:true})}
 async insert(id){const e=this.entries.get(id),suggestion=e?.source.getSnapshot().suggestion;if(!suggestion)return false;const m=[...e.mounts].find(m=>this.canUse(e,m));return m?this.accept(e,m,suggestion):false}
 async refreshBlacklist(){this.blacklist.publish({...this.blacklist.getSnapshot(),busy:true});try{this.blacklist.publish({...await this.call('blacklist'),busy:false,error:null})}catch{this.blacklist.publish({...this.blacklist.getSnapshot(),busy:false,error:true})}}
 async setBlacklist(payload){this.blacklist.publish({...this.blacklist.getSnapshot(),busy:true});try{const value=await this.call('setBlacklist',payload);this.blacklist.publish({...value,busy:false,error:null});for(const id of value.affectedSessionIds??[]){const e=this.entries.get(id);if(e){this.hide(e,'blacklist-changed');e.lastAttempt=null;if(this.activeEntry===e)this.update(e)}if(this.threads.has(id))void this.refreshThread(id)}return value}catch(error){this.blacklist.publish({...this.blacklist.getSnapshot(),busy:false,error:true});throw error}}
 threadSource(id){let s=this.threads.get(id);if(!s){s=observable({threadEnabled:true,suspended:null,busy:true});this.threads.set(id,s)}return s}
 async refreshThread(id){const s=this.threadSource(id);try{s.publish({...await this.call('thread',{sessionId:id}),busy:false})}catch{s.publish({...s.getSnapshot(),busy:false,error:true})}}
 async setThread(id,enabled){const s=this.threadSource(id);s.publish({...s.getSnapshot(),busy:true});try{s.publish({...await this.call('setThread',{sessionId:id,enabled}),busy:false});const e=this.entries.get(id);if(e){this.hide(e,'thread-setting');e.lastAttempt=null;if(enabled)this.update(e)}}catch{s.publish({...s.getSnapshot(),busy:false,error:true})}}
 invalidate(reason){for(const e of this.entries.values()){this.hide(e,reason);e.watchAbort?.abort();e.watchAbort=null;e.watchUnsupported=false;e.lastAttempt=null;if(this.activeEntry===e)this.update(e)}}
 async refreshSettings(){
  this.settings.publish({...this.settings.getSnapshot(),busy:true,error:null});
  try{const [p,usage]=await Promise.all([this.call('profiles'),this.call('usage')]);this.settings.publish({...this.settings.getSnapshot(),...Object.fromEntries(['enabled','profileFile','prompt','promptVersion','instructionInfo','activePriceQuote',...POLICY_FIELDS,...LIFECYCLE_FIELDS].filter(k=>p?.[k]!==undefined).map(k=>[k,p[k]])),profiles:Array.isArray(p)?p:p?.profiles??[],usage,busy:false,error:null});if(p?.blacklist)this.blacklist.publish({...p.blacklist,busy:false,error:null})}
  catch(error){this.settings.publish({...this.settings.getSnapshot(),busy:false,error:error.code??'request'})}
 }
 async configure(patch){const v=await this.call('configure',patch);this.settings.publish({...this.settings.getSnapshot(),...patch,...v,error:null});this.invalidate('configuration');await this.refreshSettings()}
 close(){
  if(this.closed)return;this.closed=true;for(const off of [...this.processWatches])off();this.disposeConnection();this.document.removeEventListener('visibilitychange',this.onVisibility);this.window?.removeEventListener('focus',this.onForeground);this.window?.removeEventListener('blur',this.onWindowBlur);
  for(const e of this.entries.values()){e.watchAbort?.abort();this.hide(e,'unload');for(const m of e.mounts)restore(m)}this.entries.clear();this.threads.clear();this.activeEntry=null;
 }
}
module.exports={PredictionClient,observable};
