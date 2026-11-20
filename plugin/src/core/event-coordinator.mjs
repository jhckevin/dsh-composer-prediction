/** Autonomous queue driven by completed user-origin loops; UI focus is irrelevant. */
export class EventCoordinator{
 constructor({lifecycle,engine,prepare,refresh,listCandidates,refreshCandidate=x=>x,schedule=setImmediate}){Object.assign(this,{lifecycle,engine,prepare,refresh,listCandidates,refreshCandidate,schedule});this.pending=new Map();this.running=false;this.scheduled=false;this.closed=false;this.work=Promise.resolve();}
 enqueue(id,trigger='live'){
  if(this.closed||!this.lifecycle.canGenerate(id))return;
  if(this.currentId===id&&(!this.currentRevision||this.engine.snapshots.get(id)?.revision===this.currentRevision)&&!this.engine.jobs.get(id)?.controller.signal.aborted)return;
  if(this.pending.has(id))return;
  this.pending.set(id,trigger);this.lifecycle.notify(id,'prediction-queued');if(this.running||this.scheduled)return;
  this.scheduled=true;this.schedule(()=>{this.scheduled=false;if(this.closed)return;this.work=this.drain().catch(error=>this.lifecycle.notify(id,'generation-error',{code:String(error.code??'GENERATION')}));});
 }
 async drain(){
  if(this.running)return;this.running=true;
  try{while(this.pending.size&&!this.closed){
   const [id,trigger]=this.pending.entries().next().value;this.pending.delete(id);this.currentId=id;this.currentRevision=null;
   await this.prepare(id);const state=this.refresh(id,{force:true});
   if(!state.eligible||!state.canGenerate){this.currentId=null;this.lifecycle.notify(id,'prediction-skipped',{reason:state.reason??'no-generation-grant'});continue;}
   this.currentRevision=state.revision;const epoch=this.lifecycle.saved.threads[id]?.userEpoch;
   const result=await this.engine.sample({sessionId:id,expectedTurnId:state.expectedTurnId,trigger,leaseId:'backend:'+state.revision,allowDispatch:true});
   if(this.closed)break;
   this.lifecycle.finished(id,state.revision,epoch,result);this.currentId=null;
  }}finally{this.currentId=null;this.running=false;if(this.pending.size&&!this.closed)this.enqueue(this.pending.keys().next().value,this.pending.values().next().value)}
 }
 async waitFor(id,revision,{signal}={}){
  this.enqueue(id,'live');
  while(!this.closed){
   if(signal?.aborted)return {suggestion:null,reason:'CANCELLED',canRetry:false};
   const snapshot=this.engine.snapshots.get(id);
   if(!snapshot||snapshot.revision!==revision||!this.lifecycle.snapshotCurrent(snapshot))return {suggestion:null,reason:'stale',canRetry:false};
   const cached=this.engine.peek(id);if(cached)return cached;
   const event=this.lifecycle.events(id).at(-1);
   if(event?.code==='generation-error'&&event.sourceRevision===revision)return {suggestion:null,reason:event.data?.code??'GENERATION',canRetry:true,revision};
   const version=this.lifecycle.version(id);
   try{await this.lifecycle.watch(id,version,signal)}catch{return {suggestion:null,reason:'CANCELLED',canRetry:false}}
  }
  return {suggestion:null,reason:'CANCELLED',canRetry:false};
 }
 async bootstrap({ids,reason='feature-enabled'}={}){
  if(this.closed||!this.engine.config.enabled||!this.lifecycle.config.retroactiveEnabled)return [];
  const configEpoch=this.engine.epoch;
  let candidates;try{candidates=await this.listCandidates(ids)}catch(e){this.lifecycle.notify(ids?.[0]??'__global__','retroactive-read-failed',{code:String(e.code??'HISTORY_UNAVAILABLE')});return null}
  if(this.closed||!this.engine.config.enabled||!this.lifecycle.config.retroactiveEnabled||this.engine.epoch!==configEpoch){this.lifecycle.notify(ids?.[0]??'__global__','retroactive-superseded');return [];}
  // Re-read live native metadata at the grant boundary: an async catalog scan may be stale.
  candidates=candidates.map(x=>this.refreshCandidate(x));
  const selected=this.lifecycle.selectRetrospective(candidates);
  for(const x of selected){if(x.normal!==false)this.lifecycle.notify(x.sessionId,'retroactive-start',{reason});this.enqueue(x.sessionId,'catch_up')}
  return selected.map(x=>x.sessionId);
 }
 close(){this.closed=true;this.pending.clear();return this.work}
}
