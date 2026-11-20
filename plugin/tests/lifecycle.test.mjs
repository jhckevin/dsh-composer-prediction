import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {mountHost,completedSession,source} from './support/mount-host.mjs';
import {mapContext,chooseContext,cadence,fingerprint,paired} from '../src/core/context-mapping.mjs';
const pause=()=>new Promise(r=>setTimeout(r,5));
async function until(fn){for(let i=0;i<100;i++){if(fn())return;await pause()}throw Error('condition did not settle')}
const req=(h,id,more={})=>({sessionId:id,expectedTurnId:h.controller.state(id).expectedTurnId,expectedRevision:h.controller.state(id).revision,leaseId:'fixture',trigger:'catch_up',...more});
function activate(h,id,extra={}){return h.controller.observe({sessionId:id,leaseId:'fixture',sequence:(h.fixtureSequence=(h.fixtureSequence??0)+1),interaction:h.fixtureSequence,active:true,ready:true,force:true,...extra})}
function rewriteHeader(session,config,system){session.append('request/header',{reason:'change',header:{config:{...config,system}}})}
test('logical user-origin conversations may predict in the background; only explicit thread disable blocks them',async t=>{
 const h=await mountHost(t);await completedSession(h,{id:'a'});await completedSession(h,{id:'b'});
 activate(h,'a');assert.equal(h.controller.state('b').eligible,true);
 assert.ok((await h.controller.sample(req(h,'b'))).suggestion);
 assert.ok((await h.controller.sample(req(h,'a'))).suggestion);assert.equal(h.adapter.calls.length,2);
 h.controller.setThread({sessionId:'a',enabled:false});
 assert.equal((await h.controller.sample({sessionId:'a',expectedTurnId:1})).suggestion,null);assert.equal(h.adapter.calls.length,2);
});
test('assistant usage and model traffic cannot create user activity for an unrelated conversation',async t=>{
 const h=await mountHost(t),x=await completedSession(h,{id:'a'});
 h.controller.feedbackMain({sessionId:'unrelated'},{inputTokens:100000,outputTokens:10000});
 assert.equal(h.controller.lifecycle.preference('unrelated').lastUserSentAt,null);
 assert.equal(h.controller.lifecycle.active('unrelated'),false);
 h.controller.capture({...x.config,sessionId:'unrelated',messages:x.session.deriveMessages()});
 assert.equal(h.controller.lifecycle.main.has('unrelated'),false);assert.equal(h.adapter.calls.length,0);
});
test('view leases are presentation-only and user-origin activation has no second-based expiry',async t=>{
 const h=await mountHost(t);await completedSession(h,{id:'a'});
 let clock=Date.now();h.controller.lifecycle.now=()=>clock;
 const row={sessionId:'a',leaseId:'view',active:true,ready:true,interaction:3,sequence:3};
 assert.equal(h.controller.observe(row).observation.active,true);
 assert.equal(h.controller.observe({...row,active:false,sequence:2}).observation.accepted,false);
 clock+=45*86400000;
 assert.equal(h.controller.lifecycle.active('a'),true);
 assert.ok((await h.controller.sample(req(h,'a'))).suggestion);assert.equal(h.adapter.calls.length,1);
});
test('watchdog and repeated lifecycle validation never issue model requests',async t=>{
 const h=await mountHost(t);await completedSession(h);
 for(let i=0;i<60;i++){h.controller.lifecycle.tick();activate(h,'thread-1');h.controller.state('thread-1')}
 assert.equal(h.adapter.calls.length,0);
 const r=await h.controller.sample(req(h,'thread-1'));assert.ok(r.suggestion);
 for(let i=0;i<30;i++){activate(h,'thread-1');await h.controller.sample(req(h,'thread-1'))}
 assert.equal(h.adapter.calls.length,1);
});
test('all four send-density/context-scale classes use logical turn and token budgets, never time intervals',()=>{
 const cases=[[1,100000,1000],[8,1000,1000],[1,100000,100000],[8,1000,100000]].map(([userSends,inputTokens,contextTokens])=>cadence({userSends,inputTokens,contextTokens}));
 assert.equal(new Set(cases.map(x=>x.kind)).size,4);
 assert.ok(cases.every(x=>x.turnInterval>=1&&x.tokenInterval>0&&!('intervalMs'in x)));
});
test('pending inbox, an unfinished turn, and a non-idle agent are not prediction sources',async t=>{
 const h=await mountHost(t),x=await completedSession(h);
 x.agent.inbox.nextTurn.push({id:'pending'});assert.equal(activate(h,x.session.id).eligible,false);
 x.agent.inbox.nextTurn=[];x.agent.status='waiting';assert.equal(activate(h,x.session.id).eligible,false);
 x.agent.status='idle';assert.equal(activate(h,x.session.id).eligible,true);
 const open=await completedSession(h,{id:'unfinished',closed:false});open.agent.status='idle';assert.equal(activate(h,open.session.id).eligible,false);assert.equal(h.adapter.calls.length,0);
});
test('rewriting the same turn while a prediction is running rejects its late result and old acceptance',async t=>{
 const h=await mountHost(t),x=await completedSession(h);const before=req(h,x.session.id);
 let release;h.adapter.delay=()=>new Promise(r=>release=r);
 const pending=h.controller.sample(before);await until(()=>release);
 const original=x.session.deriveMessages.bind(x.session);x.session.deriveMessages=()=>{const m=structuredClone(original());m[0].content[0].text+=' external edit';return m};
 release();const result=await pending;assert.equal(result.suggestion,null);
 const check=await h.controller.accept({...before});assert.equal(check.valid,false);
 assert.equal((await h.controller.sample(before)).suggestion,null);
 assert.equal(h.adapter.calls.length,1);
});
test('a change during audit is caught immediately before dispatch without a billed attempt',async t=>{
 const h=await mountHost(t),x=await completedSession(h),request=req(h,x.session.id);
 const oldAudit=h.controller.engine.audit;
 h.controller.engine.audit=async entry=>{await oldAudit(entry);rewriteHeader(x.session,x.config,'changed during the audit')};
 assert.equal((await h.controller.sample(request)).suggestion,null);
 assert.equal(h.adapter.calls.length,0);
 assert.equal(h.controller.engine.ledger.aggregate().attempts,0);
});
test('severe prefix loss pauses only the changed conversation and requires explicit resumption',async t=>{
 const h=await mountHost(t),x=await completedSession(h,{id:'a',system:'original-prefix '.repeat(1000)});
 activate(h,'a');
 const before=req(h,'a');assert.ok((await h.controller.sample(before)).suggestion);
 rewriteHeader(x.session,x.config,'rewritten-prefix '.repeat(1000));
 const changed=activate(h,'a');assert.equal(changed.suspended,'cache-prefix-loss');
 assert.equal((await h.controller.accept({...before})).valid,false);
 assert.equal((await h.controller.sample({...before})).suggestion,null);assert.equal(h.adapter.calls.length,1);
 const other=await completedSession(h,{id:'b'});assert.equal(h.controller.state('b').eligible,true);
 activate(h,'a');h.controller.setThread({sessionId:'a',enabled:true});assert.equal(activate(h,'a').suspended,null);
 assert.equal(h.controller.state('a').eligible,true);
});
test('an external editor can announce a transaction; no prediction runs before commit',async t=>{
 const h=await mountHost(t),x=await completedSession(h);
 h.controller.externalChanged(x.session.id,{editing:true});assert.equal(activate(h,x.session.id).eligible,false);
 assert.equal((await h.controller.sample({sessionId:x.session.id,expectedTurnId:1,leaseId:'fixture'})).suggestion,null);
 h.controller.externalChanged(x.session.id,{editing:false});assert.equal(activate(h,x.session.id).eligible,true);assert.equal(h.adapter.calls.length,0);
});
test('explicit thread preferences override the new-thread default and survive controller restart',async t=>{
 const h=await mountHost(t),x=await completedSession(h);
 await h.controller.configure({newThreadsEnabled:false});h.controller.created('new-chat',{newSession:true});
 assert.equal(h.controller.thread({sessionId:'new-chat'}).threadEnabled,false);
 h.controller.setThread({sessionId:x.session.id,enabled:false});
 await h.controller.configure({newThreadsEnabled:true});
 assert.equal(h.controller.thread({sessionId:x.session.id}).threadEnabled,false);
 await h.controller.close();
 const fresh=await source.predictionPlugin.createController(h.ctx,h.config);
 try{assert.equal(fresh.thread({sessionId:x.session.id}).threadEnabled,false);assert.equal(fresh.thread({sessionId:'another'}).threadEnabled,true)}finally{await fresh.close()}
});
test('a completed prediction survives restart and source-identical resumption without another inference',async t=>{
 const h=await mountHost(t),x=await completedSession(h),request=req(h,x.session.id);
 const result=await h.controller.sample(request);assert.ok(result.suggestion);assert.equal(h.adapter.calls.length,1);
 await h.controller.close();const fresh=await source.predictionPlugin.createController(h.ctx,h.config);
 try{
  const state=fresh.observe({sessionId:x.session.id,leaseId:'reopened',sequence:1,interaction:1,active:true,ready:true,force:true});
  const reused=await fresh.sample({sessionId:x.session.id,expectedTurnId:state.expectedTurnId,expectedRevision:state.revision,leaseId:'reopened'});
  assert.equal(reused.suggestion,result.suggestion);assert.equal(h.adapter.calls.length,1);
  const saved=fresh.engine.resultCache.get(result.key);
  assert.equal(JSON.stringify(saved).includes('验证前缀缓存'),false,'result cache does not persist the parent conversation');
 }finally{await fresh.close()}
});
test('an abstention is durable and repeated activation does not purchase it again',async t=>{
 const h=await mountHost(t),x=await completedSession(h);
 h.adapter.script=async function*(){yield {type:'text-delta',index:0,text:'{"suggestion":false}'};yield {type:'usage',usage:{inputTokens:100,cacheReadTokens:900,cacheWriteTokens:0,outputTokens:5}};yield {type:'finish',reason:{kind:'stop'}}};
 const first=await h.controller.sample(req(h,x.session.id));assert.equal(first.abstained,true);
 activate(h,x.session.id);const again=await h.controller.sample(req(h,x.session.id));assert.equal(again.abstained,true);assert.equal(h.adapter.calls.length,1);
});
test('canonical key ordering and unrelated title/log metadata do not create a second calculation',async t=>{
 const h=await mountHost(t),x=await completedSession(h),request=req(h,x.session.id);
 const result=await h.controller.sample(request);
 x.session.append('session/title',{title:'metadata-only edit'});
 assert.equal(activate(h,x.session.id).revision,request.expectedRevision);
 assert.equal((await h.controller.sample(request)).suggestion,result.suggestion);assert.equal(h.adapter.calls.length,1);
 assert.equal(fingerprint({b:2,a:1}),fingerprint({a:1,b:2}));
});
const message=(role,text)=>({role,content:[{type:'text',text}]});
function synthetic(n=12){return {sessionId:'cost',turnId:n,revision:'r',contextWindow:1000000,options:{provider:'ds',model:'test-model',system:'fixed',maxTokens:999,messages:Array.from({length:n},(_,i)=>[message('user','Goal '+i+' '+('u'+i+' ').repeat(100)),message('assistant',('response'+i+' ').repeat(300))]).flat()}}}
const quote={status:'priced',currency:'CNY',rates:{input:1,cacheRead:0.02,output:4}};
test('the selector preserves a warmed faithful full context when conversion does not robustly save money',()=>{
 const s=synthetic(12),baseline=mapContext({...s.options,messages:s.options.messages.slice(0,-1)});
 const chosen=chooseContext(s,{baseline,quote,targetTokens:12000,observedHitRatio:0.98});
 assert.equal(chosen.allowed,true);assert.equal(chosen.decision.strategy,'full');
});
test('a long changed middle can select a bounded window while preserving the original goal and complete recent turns',()=>{
 const s=synthetic(24),baseline=mapContext(s.options);const original=structuredClone(s.options);
 s.options.messages[2].content[0].text+=' changed old middle';
 const chosen=chooseContext(s,{baseline,quote,targetTokens:12000,forceMutation:false,qualityCostSlack:0});
 assert.equal(chosen.allowed,true);assert.notEqual(chosen.decision.strategy,'full');
 assert.deepEqual(chosen.options.messages.slice(0,2),s.options.messages.slice(0,2));
 assert.deepEqual(chosen.options.messages.slice(-4),s.options.messages.slice(-4));
 assert.equal(chosen.decision.estimated,true);assert.match(chosen.contextNote,/omitted/);
 assert.deepEqual(s.options.messages.at(-1),original.messages.at(-1),'the source is not mutated');
});
test('a frozen window grows by appending new dialogue and can reuse a longer prediction prefix',()=>{
 const s=synthetic(24),baseline=mapContext(s.options);s.options.messages[2].content[0].text+=' changed';
 const previous=chooseContext(s,{baseline,quote,targetTokens:18000,qualityCostSlack:0});
 assert.notEqual(previous.decision.strategy,'full');
 const next=structuredClone(s);next.options.messages.push(message('user','Next question'),message('assistant','Next answer'));next.turnId++;
 const result=chooseContext(next,{baseline:mapContext(s.options),predictionBaseline:mapContext(previous.options),previousSource:mapContext(s.options),previousPlan:previous,quote,targetTokens:18000,qualityCostSlack:0.05,observedHitRatio:0.98});
 assert.equal(result.allowed,true);assert.equal(result.decision.strategy,'frozen-window');
 assert.deepEqual(result.options.messages.slice(0,previous.options.messages.length),previous.options.messages);
});
test('window cuts never produce orphan tool results and native Codex sampling is never portably compacted',()=>{
 const s=synthetic(10);s.options.messages.splice(3,0,{role:'tool',toolCallId:'missing',content:[]});
 assert.equal(chooseContext(s,{quote}).reason,'mapping-tool-pair');assert.equal(paired(s.options.messages),false);
 const native=synthetic(24);native.nativeSampling=true;
 const r=chooseContext(native,{baseline:mapContext(native.options),quote,targetTokens:1024});
 assert.equal(r.decision.strategy,'full');
 native.contextWindow=2000;assert.equal(chooseContext(native,{quote,targetTokens:1024}).reason,'context-limit');
});

test('a changed language or length policy rejects acceptance from the old configuration epoch',async t=>{
 const h=await mountHost(t),x=await completedSession(h),request=req(h,x.session.id),epoch=h.controller.engine.epoch;
 assert.ok((await h.controller.sample(request)).suggestion);
 await h.controller.configure({maxSuggestionTokens:10});
 assert.equal((await h.controller.accept({...request,expectedConfigVersion:epoch})).valid,false);
 assert.equal(h.adapter.calls.length,1);
});
test('a cache persistence failure still reuses the valid in-memory result without paying again',async t=>{
 const h=await mountHost(t),x=await completedSession(h),request=req(h,x.session.id);
 h.controller.engine.resultCache.set=()=>{throw Object.assign(Error('disk full'),{code:'ENOSPC'})};
 const first=await h.controller.sample(request);assert.ok(first.suggestion);assert.equal(first.cachePersistence,'memory-only');
 assert.equal((await h.controller.sample(request)).suggestion,first.suggestion);assert.equal(h.adapter.calls.length,1);
});
