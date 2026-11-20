import test from'node:test';import assert from'node:assert/strict';import{mountHost,completedSession}from'./support/mount-host.mjs';
const until=async fn=>{for(let i=0;i<150;i++){if(fn())return;await new Promise(r=>setTimeout(r,5))}throw Error('not settled')};
test('normal multi-step context progress is coalesced and is not logged as invalidating a prediction that never existed',async t=>{
 const h=await mountHost(t),{session,config}=await completedSession(h,{id:'loop',closed:false});for(let i=0;i<5;i++){h.controller.capture({...config,sessionId:session.id,messages:session.deriveMessages()});h.controller.lifecycle.markDirty(session.id,'context-changed')}
 const events=h.controller.lifecycle.events(session.id);assert.equal(events.filter(e=>e.code==='prediction-invalidated').length,0);assert.equal(events.filter(e=>e.code==='parent-request').length,1);assert.equal(h.adapter.calls.length,0);
});
test('only a real queue admission is logged as queued and normal completion alone is not another admission',async t=>{
 const h=await mountHost(t),{session,agent}=await completedSession(h,{id:'q'});h.controller.coordinator.enqueue(session.id);await until(()=>h.controller.engine.results.has(session.id));const count=h.adapter.calls.length;assert.equal(count,1);assert.equal(h.controller.lifecycle.events(session.id).filter(x=>x.code==='prediction-queued').length,1);
 h.controller.lifecycle.markDirty(session.id,'assistant-running');agent.status='idle';h.controller.completed(session.id,{normal:true,turn:2,seq:1000});await new Promise(r=>setTimeout(r,20));const usage=await h.controller.usage({sessionId:session.id});assert.equal(usage.process.queued,false);assert.equal(usage.process.phase,'no-pending-prediction');assert.equal(h.adapter.calls.length,count);assert.equal(h.controller.lifecycle.events(session.id).filter(x=>x.code==='prediction-queued').length,1);
});
test('changing a source with an actual cached suggestion records one true invalidation',async t=>{
 const h=await mountHost(t);await completedSession(h,{id:'changed'});await h.controller.sample({sessionId:'changed',expectedTurnId:1,trigger:'catch_up'});assert.ok(h.controller.engine.results.get('changed').suggestion);
 h.controller.lifecycle.markDirty('changed','context-changed');h.controller.lifecycle.markDirty('changed','context-changed');const rows=h.controller.lifecycle.events('changed').filter(x=>x.code==='prediction-invalidated');assert.equal(rows.length,1);assert.equal(rows[0].data.hadPrediction,true);assert.equal(h.adapter.calls.length,1);
});

test('idle phase changes wake UI watches without adding a fake queue, activity or log entry',async t=>{
 const h=await mountHost(t);await completedSession(h,{id:'idle'});const life=h.controller.lifecycle,count=life.events('idle').length,at=life.preference('idle').lastUserSentAt,version=life.version('idle');
 const result=life.watch('idle',version,new AbortController().signal);life.signal('idle');assert.ok((await result).version>version);assert.equal(life.events('idle').length,count);assert.equal(life.preference('idle').lastUserSentAt,at);
});
