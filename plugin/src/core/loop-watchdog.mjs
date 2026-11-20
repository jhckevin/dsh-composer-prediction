/** Event budgets, never wall-clock sampling. */
export function cadence({userSends=0,inputTokens=0,outputTokens=0,contextTokens=0,queuedSends=0}={}){
 // Submission density is independent of context size; long prompts can also be dense.
 const dense=queuedSends>1||userSends>=4,large=contextTokens>=32768;
 return {kind:large?(dense?'large-dense':'large-sparse'):(dense?'small-dense':'small-sparse'),
  turnInterval:large?(dense?1:2):(dense?2:4),tokenInterval:large?(dense?4096:16384):(dense?2048:8192),sendInterval:dense?2:4};
}
export class LoopWatchdog{
 constructor(){this.rows=new Map();}
 row(id){let r=this.rows.get(id);if(!r){r={userSends:0,inputTokens:0,outputTokens:0,completedTurns:0,queuedSends:0,changes:0,checked:{userSends:0,tokens:0,completedTurns:0}};this.rows.set(id,r)}return r}
 user(id,{queued=false}={}){const r=this.row(id);r.userSends++;if(queued)r.queuedSends++;}
 usage(id,u){const r=this.row(id);r.inputTokens+=Math.max(0,u.inputTokens??0)+Math.max(0,u.cacheReadTokens??0);r.outputTokens+=Math.max(0,u.outputTokens??0);}
 completed(id){this.row(id).completedTurns++;}
 changed(id){this.row(id).changes++;}
 policy(id,contextTokens=0){return cadence({...this.row(id),contextTokens});}
 due(id,contextTokens=0){const r=this.row(id),p=this.policy(id,contextTokens);return r.changes>0||r.userSends-r.checked.userSends>=p.sendInterval||r.completedTurns-r.checked.completedTurns>=p.turnInterval||r.inputTokens+r.outputTokens-r.checked.tokens>=p.tokenInterval;}
 checked(id){const r=this.row(id);r.checked={userSends:r.userSends,tokens:r.inputTokens+r.outputTokens,completedTurns:r.completedTurns};r.changes=0;}
}
