import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mountHost,completedSession,source} from './support/mount-host.mjs';
import {ResultCache} from '../src/core/lifecycle.mjs';
import {LoopWatchdog} from '../src/core/loop-watchdog.mjs';
import {mapContext,sharedPrefix,chooseContext} from '../src/core/context-mapping.mjs';
const wait=()=>new Promise(r=>setTimeout(r,5));
async function until(fn){for(let i=0;i<200;i++){if(fn())return;await wait()}throw Error('event did not settle')}
function wire(h){const a=h.ctx.on('session/event',(s,e)=>h.controller.onSessionEvent(s,e));const b=h.ctx.on('session/created',s=>h.controller.created(s.id,{newSession:true}));return()=>{a();b()}}
async function ready(h,id){await until(()=>!!h.controller.state(id).cachedResult);await h.controller.coordinator.work;return h.controller.state(id).cachedResult}
async function catalog(t,h,rows){
 const template=await completedSession(h,{id:'catalog-template'}),base=template.session.snapshotEvents(),user=base.find(e=>e.type==='user/message').data;
 const data=new Map(rows.map(row=>{
  let events=[
   {type:'agent/inbox/spliced',seq:0,time:row.at,data:{target:'next-turn',start:0,inserted:[user]}},
   {type:'agent/inbox/spliced',seq:1,time:row.at+1,data:{target:'next-turn',start:0,removedCount:1,inserted:[]}},
   ...base.map((e,i)=>({...structuredClone(e),seq:i+2,time:(row.assistantAt??row.at+100)+i}))
  ];
  if(row.outcome)events.at(-1).data.reason={kind:row.outcome,...row.outcome==='aborted'?{reason:{kind:'user'}}:{}};
  return [row.id,{session:{...structuredClone(template.session.header),id:row.id,createdAt:row.at-1000},events,inheritedEventCount:0}];
 }));
 let observations=0,disposed=0;
 class Query extends source.Service{
  constructor(ctx){super(ctx,'sessionQuery')}
  async listSessions(){return [...data.values()].map(x=>({header:structuredClone(x.session),live:false,persisted:true}))}
  async readSession(id){const x=data.get(id);if(!x)throw Error('missing');return structuredClone(x)}
  async observeSession(id){const x=data.get(id);if(!x)throw Error('missing');observations++;return {header:structuredClone(x.session),events:structuredClone(x.events),inheritedEventCount:0,[Symbol.dispose](){disposed++}}}
 }
 await h.ctx.plugin(Query);
 return {data,get observations(){return observations},get disposed(){return disposed}};
}
test('a normal user-origin completion generates once autonomously with no UI, focus or observe request',async t=>{
 const h=await mountHost(t);wire(h);const x=await completedSession(h,{id:'background',simulateSend:true});
 const result=await ready(h,x.session.id);assert.ok(result.suggestion);assert.equal(h.adapter.calls.length,1);
 for(let i=0;i<20;i++)h.controller.coordinator.enqueue(x.session.id,'live');await new Promise(r=>setImmediate(r));
 assert.equal(h.adapter.calls.length,1);assert.equal(h.controller.lifecycle.preference(x.session.id).activation,null);
});
test('assistant output and completed events alone never activate a conversation',async t=>{
 const h=await mountHost(t);wire(h);const x=await completedSession(h,{id:'output-only',activateLoop:false});
 await new Promise(r=>setImmediate(r));h.controller.coordinator.enqueue(x.session.id,'live');await h.controller.coordinator.work;
 assert.equal(h.adapter.calls.length,0);assert.equal(h.controller.state(x.session.id).canGenerate,false);
});
test('failed, interrupted, blocked, aborted and max-token outcomes do not generate, even after partial assistant text',async t=>{
 for(const kind of ['error','interrupted','blocked','aborted','max-tokens']){
  const h=await mountHost(t);wire(h);const x=await completedSession(h,{id:'bad-'+kind,simulateSend:true,closed:false});
  x.agent.status='idle';x.session.append('turn/end',{turn:1,reason:{kind,...kind==='error'?{error:{message:'test',code:'TEST'}}:kind==='aborted'?{reason:{kind:'user'}}:{}}});
  await new Promise(r=>setImmediate(r));await h.controller.coordinator.work;
  assert.equal(h.adapter.calls.length,0,kind);assert.equal(h.controller.state(x.session.id).eligible,false,kind);
  assert.equal(h.controller.lifecycle.events(x.session.id).at(-1).code,'assistant-not-completed');
 }
});
test('a normal continuation after a failed attempt generates, without crediting assistant output as a user send',async t=>{
 const h=await mountHost(t);wire(h);const x=await completedSession(h,{id:'retry-parent',simulateSend:true,closed:false});
 const sent=h.controller.lifecycle.preference(x.session.id).lastUserSentAt;
 x.session.append('turn/end',{turn:1,reason:{kind:'interrupted'}});x.agent.status='idle';await new Promise(r=>setImmediate(r));assert.equal(h.adapter.calls.length,0);
 x.session.append('turn/start',{turn:2});x.session.append('step/start',{turn:2,step:1});
 x.session.append('assistant/message',{turn:2,step:1,stream:[],message:source.createMessage({role:'assistant',source:{kind:'model',provider:'test-provider',model:'test-model'},content:[{type:'text',text:'这次已经完整回答'}]})},{surfaceOp:'append'});
 x.session.append('step/end',{turn:2,step:1});x.session.append('turn/end',{turn:2,reason:{kind:'completed'}});
 await ready(h,x.session.id);assert.equal(h.adapter.calls.length,1);
 assert.equal(h.controller.lifecycle.preference(x.session.id).lastUserSentAt,sent);
});
test('a new turn with no new assistant response cannot reuse the previous bubble as its source',async t=>{
 const h=await mountHost(t),x=await completedSession(h);wire(h);
 x.session.append('turn/start',{turn:2});x.session.append('step/start',{turn:2,step:1});x.session.append('step/end',{turn:2,step:1});x.session.append('turn/end',{turn:2,reason:{kind:'completed'}});
 assert.equal(h.controller.state(x.session.id).eligible,false);assert.equal(h.adapter.calls.length,0);
});
test('a stored prediction remains usable after a month, even after many other conversations and a restart',async t=>{
 const h=await mountHost(t),x=await completedSession(h);const state=h.controller.state(x.session.id);
 const result=await h.controller.sample({sessionId:x.session.id,expectedTurnId:state.expectedTurnId,expectedRevision:state.revision});assert.ok(result.suggestion);
 for(let i=0;i<100;i++)h.controller.engine.resultCache.set('other-'+i,{key:'other-'+i,sourceSessionId:'other-chat-'+i,status:'ready',suggestion:'other'});
 let now=Date.now()+32*86400000;h.controller.lifecycle.now=()=>now;
 assert.equal(h.controller.state(x.session.id).cachedResult.suggestion,result.suggestion);
 assert.equal(h.controller.state(x.session.id).canGenerate,false);assert.equal(h.adapter.calls.length,1);
 await h.controller.close();const fresh=await source.predictionPlugin.createController(h.ctx,h.config);
 try{fresh.lifecycle.now=()=>now;assert.equal(fresh.state(x.session.id).cachedResult.suggestion,result.suggestion);assert.equal(h.adapter.calls.length,1)}
 finally{await fresh.close()}
});
test('persistent result storage has no age expiry or global entry-count eviction',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'prediction-persist-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 let cache=new ResultCache(dir);for(let i=0;i<200;i++)cache.set('key'+i,{key:'key'+i,sourceSessionId:'thread'+i,suggestion:'saved '+i});cache.close();
 cache=new ResultCache(dir);try{assert.equal(cache.get('key0').suggestion,'saved 0');assert.equal(cache.get('key199').suggestion,'saved 199')}finally{cache.close()}
});
test('backfill uses the latest user submission, not assistant time; it selects at most the newest three',async t=>{
 const h=await mountHost(t),now=Date.now();h.controller.lifecycle.now=()=>now;
 const q=await catalog(t,h,[{id:'a',at:now-1000},{id:'b',at:now-2000},{id:'c',at:now-3000},{id:'d',at:now-4000},{id:'stale',at:now-25*3600000,assistantAt:now-10}]);
 let announcements=0;h.ctx.on('session/created',()=>announcements++);
 const selected=await h.controller.bootstrap();assert.deepEqual(selected,['a','b','c']);
 await until(()=>h.adapter.calls.length===3);await h.controller.coordinator.work;
 assert.equal(h.adapter.calls.length,3);
 assert.equal(h.controller.lifecycle.preference('stale').lastUserSentAt,now-25*3600000);
 assert.equal(h.controller.lifecycle.events('d').at(-1).code,'retroactive-limit');
 assert.equal(h.controller.lifecycle.events('stale').at(-1).code,'retroactive-outside-window');
 assert.equal(announcements,0,'cold reads must not publish Sessions or create Agents');
 assert.equal(h.ctx.sessions.get('a'),undefined);assert.equal(q.observations,q.disposed);
 await h.controller.bootstrap();await h.controller.coordinator.work;assert.equal(h.adapter.calls.length,3,'backfill reuses saved results');
});
test('the backfill window is inclusive at 24 hours and settings can disable or resize only the retrospective batch',async t=>{
 const h=await mountHost(t),now=Date.now();h.controller.lifecycle.now=()=>now;
 await catalog(t,h,[{id:'boundary',at:now-24*3600000},{id:'older',at:now-24*3600000-1},{id:'newest',at:now-100}]);
 await h.controller.configure({retroactiveEnabled:false});assert.deepEqual(await h.controller.bootstrap(),[]);assert.equal(h.adapter.calls.length,0);
 await h.controller.configure({retroactiveEnabled:true,retroactiveHours:48,retroactiveLimit:1});
 await until(()=>h.adapter.calls.length===1);await h.controller.coordinator.work;assert.equal(h.adapter.calls[0].sessionId,'newest');
 await h.controller.configure({retroactiveHours:24,retroactiveLimit:3});await until(()=>h.adapter.calls.length===2);await h.controller.coordinator.work;
 assert.equal(h.adapter.calls.some(x=>x.sessionId==='boundary'),true);assert.equal(h.adapter.calls.some(x=>x.sessionId==='older'),false);
});
test('failed old threads may be selected but are not charged until a normal assistant reply exists',async t=>{
 const h=await mountHost(t),now=Date.now();h.controller.lifecycle.now=()=>now;
 await catalog(t,h,[{id:'broken-old',at:now-100,outcome:'interrupted'}]);
 assert.deepEqual(await h.controller.bootstrap(),['broken-old']);await new Promise(r=>setImmediate(r));await h.controller.coordinator.work;
 assert.equal(h.adapter.calls.length,0);assert.equal(h.controller.lifecycle.events('broken-old').at(-1).code,'retroactive-waiting-normal-reply');
});
test('enabling a month-old thread with a saved result does not buy a new prediction outside the backfill window',async t=>{
 const h=await mountHost(t),x=await completedSession(h);
 const state=h.controller.state(x.session.id);await h.controller.sample({sessionId:x.session.id,expectedTurnId:state.expectedTurnId});
 h.controller.lifecycle.now=()=>Date.now()+32*86400000;
 h.controller.setThread({sessionId:x.session.id,enabled:false});h.controller.setThread({sessionId:x.session.id,enabled:true});
 await new Promise(r=>setImmediate(r));await h.controller.coordinator.work;
 assert.ok(h.controller.state(x.session.id).cachedResult?.suggestion);assert.equal(h.adapter.calls.length,1);
});
test('new-thread defaults are captured at creation; they do not expire or get retroactively changed',async t=>{
 const h=await mountHost(t);wire(h);const first=await completedSession(h,{id:'born-on',simulateSend:true});await ready(h,first.session.id);
 await h.controller.configure({newThreadsEnabled:false});assert.equal(h.controller.thread({sessionId:first.session.id}).threadEnabled,true);
 const second=await completedSession(h,{id:'born-off',simulateSend:true});await new Promise(r=>setImmediate(r));await h.controller.coordinator.work;
 assert.equal(h.controller.thread({sessionId:second.session.id}).threadEnabled,false);assert.equal(h.adapter.calls.length,1);
});
test('below 50 percent pauses even small contexts; exactly 50 percent remains admissible',()=>{
 const options={provider:'p',model:'test-model',system:'same',maxTokens:100,messages:[{role:'user',content:[{type:'text',text:'goal'}]},{role:'assistant',content:[{type:'text',text:'done'}]}]};
 const current=mapContext(options),base={...current,units:[]};const shared=sharedPrefix(base,current);base.tokens=shared*2;
 const snapshot={options,sessionId:'boundary',turnId:1,revision:'r',contextWindow:100000};
 assert.equal(chooseContext(snapshot,{baseline:base,forceMutation:true,minRetainedCacheRatio:0.5}).allowed,true);
 base.tokens++;
 const paused=chooseContext(snapshot,{baseline:base,forceMutation:true,minRetainedCacheRatio:0.5});assert.equal(paused.reason,'cache-prefix-loss');assert.ok(base.tokens<1024);
});
test('mapping checks are triggered by logical send/token budgets and structure, not elapsed wall time',()=>{
 const w=new LoopWatchdog();w.checked('a');for(let i=0;i<3;i++)w.user('a');assert.equal(w.due('a',1000),false);
 w.user('a');assert.equal(w.due('a',1000),true);w.checked('a');
 w.usage('a',{inputTokens:9000,cacheReadTokens:0,outputTokens:0});assert.equal(w.due('a',1000),true);w.checked('a');
 assert.equal(w.due('a',1000),false);w.changed('a');assert.equal(w.due('a',1000),true);
 assert.equal('intervalMs'in w.policy('a',1000),false);
});
test('cumulative usage snapshots do not inflate watchdog input/output volume',async t=>{
 const h=await mountHost(t),x=await completedSession(h);
 h.controller.capture({...x.config,sessionId:x.session.id,messages:x.session.deriveMessages()});
 h.controller.feedbackMain({sessionId:x.session.id},{inputTokens:100,cacheReadTokens:900,outputTokens:5});
 h.controller.feedbackMain({sessionId:x.session.id},{inputTokens:100,cacheReadTokens:900,outputTokens:10});
 const row=h.controller.lifecycle.watchdog.row(x.session.id);assert.equal(row.inputTokens,1000);assert.equal(row.outputTokens,10);
});
test('event watches wait for a semantic change, expose special events and are canceled without a timer',async t=>{
 const h=await mountHost(t),x=await completedSession(h),before=h.controller.lifecycle.version(x.session.id),abort=new AbortController();let resolved=false;
 const watch=h.controller.watch({sessionId:x.session.id,afterVersion:before},{signal:abort.signal}).then(x=>{resolved=true;return x});
 await new Promise(r=>setImmediate(r));assert.equal(resolved,false);
 h.controller.lifecycle.notify(x.session.id,'network-retry',{retry:1});const value=await watch;assert.equal(value.event.code,'network-retry');
 const next=h.controller.watch({sessionId:x.session.id,afterVersion:value.version},{signal:abort.signal});abort.abort(Error('view closed'));await assert.rejects(next);
 const usage=await h.controller.usage({sessionId:x.session.id});assert.equal(usage.process.events.at(-1).code,'network-retry');assert.equal(h.adapter.calls.length,0);
});
test('client mapping and cost views contain no timer polling or OS-focus eligibility checks',async()=>{
 for(const name of ['src/client/controller.cjs','src/client/controls.cjs']){
  const s=await readFile(new URL('../'+name,import.meta.url),'utf8');assert.doesNotMatch(s,/setInterval|setTimeout|hasFocus\(/,name);
 }
 const s=await readFile(new URL('../src/core/lifecycle.mjs',import.meta.url),'utf8');assert.doesNotMatch(s,/45000|intervalMs|86400000|gcTime|staleTime/);
});


test('large high-send conversations remain a distinct dense class regardless of their huge input volume',()=>{
 const w=new LoopWatchdog();for(let i=0;i<8;i++)w.user('large');w.usage('large',{inputTokens:800000,outputTokens:40000});
 assert.equal(w.policy('large',100000).kind,'large-dense');assert.equal(w.policy('large',100000).turnInterval,1);
});
test('shrinking the retrospective selection revokes excluded pending grants without evicting saved results',async t=>{
 const h=await mountHost(t),l=h.controller.lifecycle,now=Date.now();l.now=()=>now;
 const rows=[{sessionId:'a',lastUserSentAt:now-1},{sessionId:'b',lastUserSentAt:now-2},{sessionId:'c',lastUserSentAt:now-3}];
 l.selectRetrospective(rows);assert.equal(l.canGenerate('c'),true);l.configure({retroactiveLimit:1});l.selectRetrospective(rows);
 assert.equal(l.canGenerate('a'),true);assert.equal(l.canGenerate('b'),false);assert.equal(l.canGenerate('c'),false);
});
test('global catalog failures wake the current process view, while identical read failures do not spin watchers',async t=>{
 const h=await mountHost(t),l=h.controller.lifecycle;await completedSession(h);
 const before=l.version('thread-1'),pending=l.watch('thread-1',before);
 l.notify('__global__','retroactive-read-failed',{code:'SERVICE_UNAVAILABLE'});const event=await pending;
 assert.equal(event.event.code,'retroactive-read-failed');assert.equal(l.events('thread-1').at(-1).data.code,'SERVICE_UNAVAILABLE');
 const version=l.version('thread-1');l.notify('__global__','retroactive-read-failed',{code:'SERVICE_UNAVAILABLE'});assert.equal(l.version('thread-1'),version);
 assert.equal(h.adapter.calls.length,0);
});


test('prediction inherits DSH native effective surface after compaction instead of resurrecting shadowed raw history',async t=>{
 const h=await mountHost(t),x=await completedSession(h,{system:'stable '.repeat(4000),tools:false});
 const user=x.session.snapshotEvents().find(e=>e.type==='user/message');
 x.session.append('system/message',{turn:1,step:1,message:source.createMessage({role:'system',source:{kind:'system'},content:[{type:'text',text:'Frozen summary: the user is testing cache preservation.'}]})},{surfaceOp:{op:'replace',startSeq:user.seq,endSeq:user.seq},sourceEventSeqs:[user.seq]});
 const state=h.controller.observe({sessionId:x.session.id,leaseId:'compact-test',sequence:1,interaction:1,active:true,ready:true,force:true});
 assert.equal(state.eligible,true);const result=await h.controller.sample({sessionId:x.session.id,expectedTurnId:state.expectedTurnId,expectedRevision:state.revision});assert.ok(result.suggestion);
 const input=JSON.stringify(h.adapter.calls[0].messages);assert.ok(input.includes('Frozen summary'));assert.ok(!input.includes('验证前缀缓存'));
 assert.ok(x.session.snapshotEvents().some(e=>e.type==='user/message'&&JSON.stringify(e).includes('验证前缀缓存')));
});


test('releasing a completed native Agent does not cancel or duplicate the thread-owned prediction',async t=>{
 const h=await mountHost(t),x=await completedSession(h);let release;h.adapter.delay=()=>new Promise(r=>release=r);
 const state=h.controller.state(x.session.id),pending=h.controller.sample({sessionId:x.session.id,expectedTurnId:state.expectedTurnId,expectedRevision:state.revision});
 await until(()=>release);x.detach();h.controller.runtimeDetached(x.session.id);release();
 const result=await pending;assert.ok(result.suggestion);assert.equal(h.adapter.calls.length,1);assert.equal(h.controller.state(x.session.id).cachedResult.suggestion,result.suggestion);
});


test('a stale asynchronous backfill catalog cannot downgrade a normally completed live source or hide its paid result',async t=>{
 const h=await mountHost(t),x=await completedSession(h);const state=h.controller.state(x.session.id);
 const r=await h.controller.sample({sessionId:x.session.id,expectedTurnId:state.expectedTurnId,expectedRevision:state.revision});assert.ok(r.suggestion);
 h.controller.coordinator.listCandidates=async()=>[{sessionId:x.session.id,lastUserSentAt:Date.now(),lastUserId:x.session.deriveMessages().find(m=>m.role==='user').id,normal:false}];
 await h.controller.bootstrap({ids:[x.session.id]});await new Promise(r=>setImmediate(r));await h.controller.coordinator.work;
 assert.equal(h.controller.lifecycle.saved.threads[x.session.id].awaitingAssistant,false);assert.equal(h.controller.state(x.session.id).cachedResult.suggestion,r.suggestion);assert.equal(h.adapter.calls.length,1);
 h.controller.lifecycle.saved.threads[x.session.id].awaitingAssistant=true;h.controller.lifecycle.saved.threads[x.session.id].activation=null;h.controller.lifecycle.saved.threads[x.session.id].retroGrant=false;
 await h.controller.prepareSession(x.session.id);assert.equal(h.controller.state(x.session.id).eligible,true);assert.equal(h.adapter.calls.length,1);
});


test('native context-window metadata changes invalidate a reused context plan before dispatch',async t=>{
 const h=await mountHost(t),x=await completedSession(h);wire(h);const initial=h.controller.state(x.session.id);
 x.session.append('request/context',{provider:x.config.provider,model:x.config.model,contextWindow:128});
 const next=h.controller.observe({sessionId:x.session.id,leaseId:'limit',sequence:1,interaction:0,active:true,ready:true,force:true});
 assert.equal(next.eligible,false);assert.equal(next.reason,'context-limit');assert.equal(h.adapter.calls.length,0);
});


test('an asynchronous backfill scan belongs to its starting configuration and cannot dispatch on a later backend generation',async t=>{
 const h=await mountHost(t),x=await completedSession(h);const st=h.controller.state(x.session.id);await h.controller.sample({sessionId:x.session.id,expectedTurnId:st.expectedTurnId,expectedRevision:st.revision});
 let release;h.controller.coordinator.listCandidates=()=>new Promise(r=>release=r);const pending=h.controller.bootstrap({ids:[x.session.id]});
 await h.controller.configure({promptVersion:'changed-during-catalog'});release([{sessionId:x.session.id,lastUserSentAt:Date.now(),normal:true}]);assert.deepEqual(await pending,[]);assert.equal(h.adapter.calls.length,1);assert.equal(h.controller.lifecycle.canGenerate(x.session.id),false);
});
test('a queued backfill grant cannot survive a configuration generation change',async t=>{
 const h=await mountHost(t),x=await completedSession(h,{activateLoop:false});h.controller.lifecycle.selectRetrospective([{sessionId:x.session.id,lastUserSentAt:Date.now(),normal:true}]);assert.equal(h.controller.lifecycle.canGenerate(x.session.id),true);
 await h.controller.configure({promptVersion:'changed-before-queue'});assert.equal(h.controller.lifecycle.canGenerate(x.session.id),false);h.controller.coordinator.enqueue(x.session.id,'catch_up');await new Promise(r=>setImmediate(r));assert.equal(h.adapter.calls.length,0);
});


test('a stale cold catalog cut cannot overwrite a newer committed completion after the live Session is detached',async t=>{
 const h=await mountHost(t),x=await completedSession(h);const st=h.controller.state(x.session.id);await h.controller.sample({sessionId:x.session.id,expectedTurnId:st.expectedTurnId,expectedRevision:st.revision});const terminal=x.session.snapshotEvents().findLast(e=>e.type==='turn/end');h.controller.lifecycle.completed(x.session.id,{normal:true,seq:terminal.seq,turn:1});
 h.controller.coordinator.refreshCandidate=x=>x;h.controller.coordinator.listCandidates=async()=>[{sessionId:x.session.id,lastUserSentAt:Date.now(),normal:false,lastEventSeq:terminal.seq-1}];
 await h.controller.bootstrap({ids:[x.session.id]});await new Promise(r=>setImmediate(r));await h.controller.coordinator.work;assert.equal(h.controller.state(x.session.id).eligible,true);assert.equal(h.controller.lifecycle.saved.threads[x.session.id].awaitingAssistant,false);assert.equal(h.adapter.calls.length,1);
});


test('a valid prepared source bridges live Session detachment without canceling the independent prediction job',async t=>{
 const h=await mountHost(t),x=await completedSession(h);await h.controller.prepareSession(x.session.id);const sourceSnapshot=h.controller.engine.snapshots.get(x.session.id);const originalGet=h.ctx.sessions.get;
 try{h.ctx.sessions.get=function(id){return id===x.session.id?undefined:originalGet.call(this,id)};assert.equal(h.controller.lifecycle.snapshotCurrent(sourceSnapshot),true)}finally{h.ctx.sessions.get=originalGet}
});
