import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { mountHost, completedSession, collect, source } from './support/mount-host.mjs';

async function bounded(predicate) {
 for(let n=0;n<100;n++){if(predicate())return;await delay(5);}
 throw new Error('integration event did not settle');
}
async function serve(t,host) {
 const server=createServer((req,res)=>{
  const route=host.routes.get('/composer-prediction');
  if(!route){res.writeHead(404);res.end();return;}
  Promise.resolve(route.handler(req,res)).catch(error=>{res.writeHead(500);res.end(String(error));});
 });
 server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base='http://127.0.0.1:'+server.address().port;
 let sequence=0;
 return async(method,payload={},extra={})=>{
  if(payload.sessionId&&['state','sample','accept'].includes(method)&&!extra.inactive){
   await fetch(base+'/composer-prediction/observe',{method:'POST',headers:{authorization:'Bearer test-fixture','content-type':'application/json'},body:JSON.stringify({type:'client-request',rpcId:'activity-'+(++sequence),method:'observe',payload:{sessionId:payload.sessionId,leaseId:'fixture-rpc',sequence,interaction:sequence,active:true,ready:true}})});
   payload={...payload,...method==='state'?{}:{leaseId:'fixture-rpc'}};
  }
  const response=await fetch(base+'/composer-prediction/'+method,{
   method:'POST',headers:{authorization:'Bearer test-fixture','content-type':'application/json',...extra.headers},
   body:JSON.stringify({type:'client-request',rpcId:'integration-request',method,payload}),signal:extra.signal
  });
  const raw=await response.text();let body;try{body=JSON.parse(raw);}catch{body=raw;}
  return {status:response.status,body,raw};
 };
}
test('pinned real Session/header/toolHistory reconstructs a prediction after restart without captured LLM traffic',async t=>{
 const h=await mountHost(t),{session,config,declarations}=await completedSession(h);
 const before=structuredClone(session.snapshotEvents()),messages=session.deriveMessages();
 assert.equal(h.controller.state(session.id).eligible,true);
 const result=await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'catch_up'});
 assert.equal(result.suggestion,'继续验证缓存命中');
 assert.equal(h.adapter.calls.length,1);
 const call=h.adapter.calls[0];
 for(const [key,value] of Object.entries(config))assert.deepEqual(call[key],value);
 assert.equal(call.sessionId,session.id,'cache affinity remains the parent identity');
 assert.deepEqual(call.tools,declarations);
 assert.deepEqual(call.toolHistory,session.toolHistory());
 assert.deepEqual(call.messages.slice(0,-1),messages,'entire actual derived model context must survive');
 assert.match(call.messages.at(-1).content[0].text,/Return only JSON matching this schema/);
 assert.equal(call.purpose,'composer-prediction');
 assert.deepEqual(session.snapshotEvents(),before,'prediction must never append draft or bookkeeping to parent history');
 const second=await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'live'});
 assert.equal(second.suggestion,result.suggestion);
 assert.equal(h.adapter.calls.length,1,'live/catchup share the same completed source result');
});
test('canonical persistent header wins over an unrelated last middleware capture',async t=>{
 const h=await mountHost(t),{session,config}=await completedSession(h);
 h.controller.capture({sessionId:session.id,provider:'wrong-route',model:'wrong-model',messages:[],system:'wrong-system'});
 const result=await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'catch_up'});
 assert.ok(result.suggestion);
 assert.equal(h.adapter.calls[0].provider,config.provider);
 assert.equal(h.adapter.calls[0].model,config.model);
 assert.equal(h.adapter.calls[0].system,config.system);
 assert.equal(h.adapter.calls[0].messages.length,3);
});
test('real AgentRegistry turn projection refuses open/running/stale sources before provider dispatch',async t=>{
 const h=await mountHost(t),opened=await completedSession(h,{id:'running',closed:false});
 assert.equal(h.controller.state(opened.session.id).eligible,false);
 assert.equal((await h.controller.sample({sessionId:opened.session.id,expectedTurnId:1,trigger:'live'})).suggestion,null);
 opened.agent.status='idle';
 assert.equal(h.controller.state(opened.session.id).eligible,false,'open turn log rejects even if status says idle');
 const {session}=await completedSession(h,{id:'finished'});
 assert.equal((await h.controller.sample({sessionId:session.id,expectedTurnId:0,trigger:'catch_up'})).reason,'stale');
 assert.equal(h.adapter.calls.length,0);
});
test('concurrent consumers deduplicate one real LlmRuntime call and share immutable source context',async t=>{
 const h=await mountHost(t),{session}=await completedSession(h);
 let release;h.adapter.delay=()=>new Promise(resolve=>{release=resolve;});
 const request={sessionId:session.id,expectedTurnId:1,trigger:'catch_up'};
 const a=h.controller.sample(request),b=h.controller.sample({...request,trigger:'live'});
 await bounded(()=>!!release);
 assert.equal(h.adapter.calls.length,1);
 release();
 assert.equal((await a).suggestion,(await b).suggestion);
 assert.equal(h.adapter.calls.length,1);
});
test('tool-call response from actual runtime is suppressed and never enters the Session surface',async t=>{
 const h=await mountHost(t),{session}=await completedSession(h);
 const before=structuredClone(session.snapshotEvents());
 h.adapter.script=async function*(){
  yield {type:'block-start',index:0,blockType:'tool-call'};
  yield {type:'tool-call-delta',index:0,id:'not-executed',name:'read',argumentsDelta:'{}'};
  yield {type:'block-end',index:0,block:{type:'tool-call',id:'not-executed',name:'read',arguments:'{}'}};
  yield {type:'finish',reason:{kind:'stop'}};
 };
 assert.equal((await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'catch_up'})).suggestion,null);
 assert.deepEqual(session.snapshotEvents(),before);
 assert.equal(h.adapter.calls.length,1);
});
test('plugin apply mounts actual Cordis middleware + Connection owner RPC and unloads registrations/lock',async t=>{
 const h=await mountHost(t,{plugin:true}),{session,config,declarations}=await completedSession(h);
 const rpc=await serve(t,h);
 assert.equal(h.routes.size,1);
 await collect(h.ctx.llm.stream({...config,tools:declarations,toolHistory:session.toolHistory(),sessionId:session.id,messages:session.deriveMessages()}));
 assert.equal(h.adapter.calls.length,1,'normal parent call delegates through middleware');
 const state=await rpc('state',{sessionId:session.id});
 assert.equal(state.status,200);assert.equal(state.body.result.ok,true);
 assert.equal(state.body.result.value.eligible,true);
 assert.ok(!state.raw.includes('stable system prompt'));
 assert.ok(!state.raw.includes('验证前缀缓存'));
 const result=await rpc('sample',{sessionId:session.id,expectedTurnId:1,trigger:'manual_retry',leaseId:'owner-1'});
 assert.equal(result.status,200);assert.equal(result.body.result.value.suggestion,'继续验证缓存命中');
 assert.equal(h.adapter.calls.length,2,'prediction delegates once through the same actual runtime');
 assert.equal(h.adapter.calls[1].purpose,'composer-prediction');
 await assert.rejects(source.predictionPlugin.createController(h.ctx,h.config),e=>e.code==='STORAGE_OWNED');
 await h.pluginFiber.dispose();
 assert.equal(h.routes.size,0,'Connection registration follows plugin fiber ownership');
 const reopened=await source.predictionPlugin.createController(h.ctx,h.config);await reopened.close();
});
test('actual Connection trust/auth boundary denies unauthenticated and cross-origin prediction RPC',async t=>{
 const h=await mountHost(t,{plugin:true}),{session}=await completedSession(h),rpc=await serve(t,h);
 const unauth=await rpc('state',{sessionId:session.id},{headers:{authorization:''}});
 assert.equal(unauth.status,401);
 const cross=await rpc('state',{sessionId:session.id},{headers:{origin:'https://attacker.invalid'}});
 assert.equal(cross.status,403);
 const bad=await rpc('sample',{sessionId:session.id,expectedTurnId:1,trigger:'live',apiKey:'should-not-cross'});
 assert.equal(bad.body.result.ok,false);assert.equal(bad.body.result.error.code,'prediction/invalid-request');
 assert.equal(h.adapter.calls.length,0);
});
test('parent running cancels the in-flight sample; unresolved usage blocks repeat payment on the same thread',async t=>{
 const h=await mountHost(t,{plugin:true}),{session,agent}=await completedSession(h),rpc=await serve(t,h);
 let begun=false;h.adapter.delay=options=>new Promise((resolve,reject)=>{
  begun=true;options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true});
 });
 const pending=rpc('sample',{sessionId:session.id,expectedTurnId:1,trigger:'manual_retry',leaseId:'main'});
 await bounded(()=>begun);
 agent.status='running';h.ctx.emit('agent/status',{agent,status:'running'});
 const cancelled=await pending;
 assert.equal(cancelled.body.result.value.suggestion,null);
 h.adapter.delay=null;
 session.append('turn/start',{turn:2});session.append('step/start',{turn:2,step:1});session.append('assistant/message',{turn:2,step:1,stream:[],message:source.createMessage({role:'assistant',source:{kind:'model',provider:'test-provider',model:'test-model'},content:[{type:'text',text:'第二轮完整回复'}]})},{surfaceOp:'append'});session.append('step/end',{turn:2,step:1});session.append('turn/end',{turn:2,reason:{kind:'completed'}});
 agent.status='idle';h.ctx.emit('agent/status',{agent,status:'idle'});
 const next=await rpc('sample',{sessionId:session.id,expectedTurnId:2,trigger:'manual_retry',leaseId:'main'});
 assert.equal(next.body.result.value.suggestion,null);
 assert.equal(next.body.result.value.reason,'BILLING_UNRECONCILED');
 assert.equal(h.adapter.calls.length,1,'no second paid attempt while cancelled usage is unresolved');
});
test('audit JSONL consists of parseable records and deduplicated captures store original parent snapshots',async t=>{
 const h=await mountHost(t),{session}=await completedSession(h);
 await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'live'});
 const raw=await readFile(join(h.directory,'samples.jsonl'),'utf8');
 const rows=raw.trim().split('\n').map(JSON.parse);
 assert.equal(rows.length,1);
 const context=JSON.parse(await readFile(join(h.directory,'contexts',rows[0].contextId+'.json'),'utf8'));
 assert.deepEqual(context.messages,session.deriveMessages());
 assert.equal(context.sessionId,session.id);
});

test('stale sample cannot acquire a lease that blocks the sole valid owner cancellation',async t=>{
 const h=await mountHost(t),{session}=await completedSession(h);
 const stale=await h.controller.sample({sessionId:session.id,expectedTurnId:0,trigger:'live',leaseId:'stale-consumer'});
 assert.equal(stale.reason,'stale');
 let started=false;h.adapter.delay=options=>new Promise((resolve,reject)=>{started=true;options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true});});
 const pending=h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'live',leaseId:'fixture'});
 await bounded(()=>started);
 const cancelled=h.controller.cancel({sessionId:session.id,leaseId:'fixture'});
 assert.equal(cancelled.cancelled,true,'rejected request must not remain a consumer owner');
 assert.equal((await pending).suggestion,null);
});
test('aborting the first RPC consumer does not cancel the deduplicated prediction still owned by a second consumer',async t=>{
 const h=await mountHost(t),{session}=await completedSession(h);
 let release;h.adapter.delay=()=>new Promise(resolve=>{release=resolve;});
 const firstSignal=new AbortController(),secondSignal=new AbortController();
 const request={sessionId:session.id,expectedTurnId:1,trigger:'catch_up'};
 const first=h.controller.sample({...request,leaseId:'fixture'},{signal:firstSignal.signal});
 const second=h.controller.sample({...request,leaseId:'fixture'},{signal:secondSignal.signal});
 await bounded(()=>!!release);assert.equal(h.adapter.calls.length,1);
 firstSignal.abort(new Error('first view disconnected'));
 assert.equal((await first).suggestion,null);
 assert.equal(h.adapter.calls[0].signal.aborted,false,'other view still owns upstream inference');
 release();assert.equal((await second).suggestion,'继续验证缓存命中');
 assert.equal(h.adapter.calls.length,1);
});
test('closing a UI consumer cannot cancel an autonomous backend prediction owner',async t=>{
 const h=await mountHost(t),{session}=await completedSession(h);
 let release;h.adapter.delay=()=>new Promise(resolve=>release=resolve);
 h.controller.coordinator.enqueue(session.id,'live');await bounded(()=>!!release);
 const state=h.controller.state(session.id),view=h.controller.sample({sessionId:session.id,expectedTurnId:1,expectedRevision:state.revision,leaseId:'view'});
 await new Promise(r=>setTimeout(r,5));
 assert.equal(h.controller.cancel({sessionId:session.id,leaseId:'view'}).cancelled,true);
 assert.equal((await view).suggestion,null);assert.equal(h.adapter.calls[0].signal.aborted,false);
 release();await h.controller.coordinator.work;
 assert.equal(h.controller.state(session.id).cachedResult.suggestion,'继续验证缓存命中');assert.equal(h.adapter.calls.length,1);
});
test('hiding an already completed suggestion retains the per-turn result cache and avoids another inference',async t=>{
 const h=await mountHost(t),{session}=await completedSession(h),request={sessionId:session.id,expectedTurnId:1,trigger:'catch_up',leaseId:'fixture'};
 const result=await h.controller.sample(request);assert.ok(result.suggestion);
 h.controller.cancel({sessionId:session.id,leaseId:'fixture'});
 const reused=await h.controller.sample({...request,trigger:'live'});
 assert.equal(reused.suggestion,result.suggestion);assert.equal(h.adapter.calls.length,1);
});

test('production host lowers parent High to native off without editing main config or repeating a cached prediction',async t=>{
 const h=await mountHost(t);
 h.adapter.resolveModel=async(provider,model)=>({provider,id:model,name:model,reasoning:{efforts:[{id:'off',name:'Off'},{id:'low',name:'Low'},{id:'high',name:'High'}]},toolUpdate:'in-history',inputModalities:['text']});
 const {session,config}=await completedSession(h);const before=structuredClone(session.snapshotEvents());
 const r=await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'catch_up'});assert.equal(r.suggestion,'继续验证缓存命中');assert.equal(h.adapter.calls.length,1);assert.equal(h.adapter.calls[0].reasoningEffort,'off');assert.equal(config.reasoningEffort,'high');assert.deepEqual(session.snapshotEvents(),before);
 await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'live'});assert.equal(h.adapter.calls.length,1);
});

test('reasoning mode persists, validates and isolates cached results',async t=>{
 const h=await mountHost(t);h.adapter.resolveModel=async(provider,model)=>({provider,id:model,name:model,reasoning:{efforts:[{id:'off',name:'Off'},{id:'high',name:'High'}]},toolUpdate:'in-history',inputModalities:['text']});
 const {session}=await completedSession(h);assert.equal(h.controller.engine.settings().reasoningMode,'minimum');
 await h.controller.configure({reasoningMode:'configured'});
 assert.equal(JSON.parse(await readFile(join(h.directory,'settings.json'),'utf8')).reasoningMode,'configured');
 let r=await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'catch_up'});assert.equal(r.suggestion,'继续验证缓存命中');assert.equal(h.adapter.calls.at(-1).reasoningEffort,'high');

 await h.controller.configure({reasoningMode:'minimum'});
 r=await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'live'});assert.equal(r.reason,'cache-only');assert.equal(h.adapter.calls.length,1);
 r=await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'manual_retry',requestId:'reasoning-test'});assert.equal(r.suggestion,'继续验证缓存命中',JSON.stringify(r));assert.equal(h.adapter.calls.at(-1).reasoningEffort,'off');
 const n=h.adapter.calls.length;await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'live'});assert.equal(h.adapter.calls.length,n);
 await assert.rejects(h.controller.configure({reasoningMode:'typo'}));assert.equal(h.controller.engine.settings().reasoningMode,'minimum');
});
