import{readFileSync,writeFileSync,renameSync}from'node:fs';
/** Account balance recovery is event-driven. It never polls by seconds or generates text to test funds. */
export class BalanceWatchdog{
 constructor({path,resolveRoute,probe,onEvent=()=>{},onResume=async()=>{},enabled=()=>true,activationFor=()=>null,epochFor=()=>null,configKey=()=>'',now=()=>Date.now()}){
  Object.assign(this,{path,resolveRoute,probe,onEvent,onResume,enabled,activationFor,epochFor,configKey,now});this.closed=false;this.flights=new Map();this.tokens=new Map();this.rows={};
  if(path)try{this.rows=JSON.parse(readFileSync(path,'utf8')).accounts??{};for(const r of Object.values(this.rows))if(r.paused&&!r.originSessionId){r.paused=false;r.waiting={}}}catch(e){if(e.code!=='ENOENT')throw e}
 }
 persist(){if(!this.path||this.closed)return;writeFileSync(this.path+'.tmp',JSON.stringify({version:1,accounts:this.rows}),{mode:0o600});renameSync(this.path+'.tmp',this.path)}
 row(route){return this.rows[route.key]??= {paused:false,checks:0,waiting:{},lastResult:null}}
 route(profile,snapshot){return this.resolveRoute(profile,snapshot)}
 status(profile,snapshot){try{const route=this.route(profile,snapshot),r=this.rows[route.key];return{paused:!!r?.paused,checks:r?.checks??0,lastResult:r?.lastResult??null,supported:route.supported!==false}}catch{return{paused:false,checks:0,lastResult:null,supported:false}}}
 async before({profile,snapshot,trigger}){
  if(trigger==='manual_retry')return;const route=this.route(profile,snapshot),r=this.row(route);if(!r.paused)return;
  this.wait(r,snapshot);this.persist();throw Object.assign(Error('Automatic prediction paused for insufficient balance'),{code:'BALANCE_PAUSED',notDispatched:true});
 }
 wait(r,snapshot){r.waiting[snapshot.sessionId]={sessionId:snapshot.sessionId,revision:snapshot.revision,turnId:snapshot.turnId,userEpoch:this.epochFor(snapshot.sessionId),originActivation:this.activationFor(snapshot.sessionId),configKey:this.configKey()};}
 rejected({profile,snapshot,trigger}){if(this.closed)return;const route=this.route(profile,snapshot),r=this.row(route);r.generation=(r.generation??0)+1;this.tokens.delete(route.key);r.paused=true;r.originSessionId=snapshot.sessionId;r.lastResult={available:false,source:'provider-402',checkedAt:this.now()};if(trigger!=='manual_retry')this.wait(r,snapshot);this.persist();this.onEvent(snapshot.sessionId,'balance-paused',{});}
 succeeded({profile,snapshot}){if(this.closed)return;const route=this.route(profile,snapshot),r=this.rows[route.key];if(!r?.paused)return;delete r.waiting[snapshot.sessionId];r.generation=(r.generation??0)+1;r.paused=false;r.lastResult={available:true,source:'model-success',checkedAt:this.now()};this.persist();void this.resume(route,r);}
 async resume(route,r){if(!this.enabled())return;const waiters=Object.values(r.waiting);r.waiting={};this.persist();for(const waiter of waiters){if(this.closed||r.paused){for(const pending of waiters.slice(waiters.indexOf(waiter)))r.waiting[pending.sessionId]=pending;this.persist();break;}try{await this.onResume(waiter,route.key)}catch{this.onEvent(waiter.sessionId,'balance-resume-skipped',{})}}}
 async pulse({profile,snapshot,checkpoint,force=false}){
  if(this.closed)return{closed:true};if(!force&&!this.enabled())return this.status(profile,snapshot);const route=this.route(profile,snapshot),r=this.row(route);if(!force&&!r.paused){if(r.lastResult?.available===true&&Object.keys(r.waiting).length)await this.resume(route,r);return this.status(profile,snapshot);}
  const generation=r.generation??0,prior=this.flights.get(route.key);if(prior?.generation===generation)return prior.promise;
  const seen=this.tokens.get(route.key)??new Set();if(!force&&seen.has(checkpoint))return this.status(profile,snapshot);seen.add(checkpoint);while(seen.size>32)seen.delete(seen.values().next().value);this.tokens.set(route.key,seen);
  if(route.supported===false){r.lastResult={available:null,source:'unsupported',checkedAt:this.now()};this.persist();this.onEvent(snapshot.sessionId,'balance-query-unavailable',{});return this.status(profile,snapshot)}
  const work=(async()=>{r.checks++;this.onEvent(snapshot.sessionId,'balance-checking',{});let result;try{result=await this.probe(route);if(typeof result?.available!=='boolean')throw Error('Invalid balance response')}catch{if(this.closed)return {closed:true};if(generation!==(r.generation??0))return this.status(profile,snapshot);r.lastResult={available:null,source:'query-failed',checkedAt:this.now()};this.persist();this.onEvent(snapshot.sessionId,'balance-query-failed',{});return this.status(profile,snapshot)}
   if(this.closed)return{closed:true};if(generation!==(r.generation??0))return this.status(profile,snapshot);r.lastResult={available:result.available,source:'balance-api',checkedAt:this.now(),balances:result.balances??[]};const wasPaused=r.paused;
   if(result.available){r.generation=(r.generation??0)+1;r.paused=false;this.persist();this.onEvent(snapshot.sessionId,'balance-available',{});if(wasPaused)await this.resume(route,r)}else{this.persist();this.onEvent(snapshot.sessionId,wasPaused?'balance-still-empty':'balance-observed-empty',{})}
   return this.status(profile,snapshot);
  })();const flight={generation,promise:work};this.flights.set(route.key,flight);try{return await work}finally{if(this.flights.get(route.key)===flight)this.flights.delete(route.key)}
 }
 pendingSessions(){return [...new Set(Object.values(this.rows).filter(r=>r.paused||Object.keys(r.waiting??{}).length).flatMap(r=>[...Object.keys(r.waiting??{}),r.originSessionId].filter(Boolean)))]}
 async close(){this.closed=true;await Promise.allSettled([...this.flights.values()].map(x=>x.promise));this.flights.clear();this.tokens.clear()}
}
