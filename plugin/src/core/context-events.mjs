/** Batch structural notifications at request/turn boundaries, never with a timer. */
export class ContextEvents {
 constructor(lifecycle){this.lifecycle=lifecycle;this.pending=new Map();this.seen=new Map()}
 handle(id,event){
  if(!/^compaction\//.test(event.type))return false;
  if(Number.isSafeInteger(event.seq)){const last=this.seen.get(id);if(last!==undefined&&event.seq<=last)return true;this.seen.set(id,event.seq);if(this.seen.size>128)this.seen.delete(this.seen.keys().next().value)}
  if(event.type==='compaction/prune'){
   let p=this.pending.get(id);if(!p){p={count:0,shadowedTokens:0,firstSeq:event.seq,lastSeq:event.seq};this.pending.set(id,p);this.lifecycle.markDirty(id,'context-changed')}
   p.count++;p.lastSeq=event.seq;p.shadowedTokens+=Number.isSafeInteger(event.data?.shadowedTokenCount)?event.data.shadowedTokenCount:0;return true;
  }
  this.flush(id);
  if(event.type==='compaction/start')this.lifecycle.notify(id,'context-summary-started',{compactionId:event.data?.compactionId??null});
  else if(event.type==='compaction/summary')this.lifecycle.markDirty(id,'context-changed');
  else if(event.type==='compaction/end')this.lifecycle.notify(id,'context-summary-ended',{compactionId:event.data?.compactionId??null});
  return true;
 }
 flush(id){const p=this.pending.get(id);if(!p)return;this.pending.delete(id);this.lifecycle.notify(id,'context-pruned',{...p,modelRequests:0})}
}
