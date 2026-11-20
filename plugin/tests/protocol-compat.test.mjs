import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProfile,profileCacheScope} from '../src/core/profiles.mjs';
import {buildGenericRequest,buildResponsesRequest,runTransport} from '../src/core/transports.mjs';
import {providerError} from '../src/core/protocol-compat.mjs';
import {normalizeUsage,quotePrice,priceUsage,UsageLedger} from '../src/core/billing.mjs';
import {publicQuote,costShare} from '../src/core/thread-accounting.mjs';
import {BalanceWatchdog} from '../src/core/balance-watchdog.mjs';
import {PredictionEngine} from '../src/core/engine.mjs';
import {classifyFailure} from '../src/core/recovery.mjs';
const at='2026-11-14T00:00:00Z',book={versions:[{id:'declared',effectiveFrom:'2026-01-01T00:00:00Z',currency:'USD',rates:{input:2,cacheRead:.2,cacheWrite:2.5,output:6}}]};
const profile=protocol=>validateProfile({version:1,id:'third',label:'Third party',protocol,baseURL:'https://gateway.example/v1',model:'model',accountId:'synthetic',credential:{env:'SYNTHETIC'},request:{maxTokens:128},cache:{},pricing:book});
const text=text=>({type:'text',text}),snapshot=()=>({sessionId:'s',turnId:1,revision:'r',contextWindow:8192,options:{provider:'third',model:'model',maxTokens:128,reasoningEffort:'high',system:'stable system',messages:[{role:'user',content:[text('继续')]},{role:'assistant',content:[text('请问需要继续吗？')]}]}});
const reply=protocol=>protocol==='chat-completions'?{choices:[{message:{role:'assistant',content:'{"suggestion":"继续"}'},finish_reason:'stop'}],usage:{prompt_tokens:1000,prompt_tokens_details:{cached_tokens:900},completion_tokens:12}}:protocol==='anthropic-messages'?{type:'message',role:'assistant',content:[{type:'text',text:'{"suggestion":"继续"}'}],stop_reason:'end_turn',usage:{input_tokens:100,cache_read_input_tokens:900,cache_creation_input_tokens:0,output_tokens:12}}:{status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'{"suggestion":"继续"}'}]}],usage:{input_tokens:1000,input_tokens_details:{cached_tokens:900},output_tokens:12}};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
for(const protocol of ['responses','anthropic-messages','chat-completions']){
 test(protocol+': one physical JSON request, final usage and isolated credentials',async()=>{
  const p=profile(protocol),s=snapshot(),before=JSON.stringify(s),calls=[];const configured={...p,capabilities:{responseMode:'json'}};
  const r=await runTransport(configured,s,'prediction',{credential:'synthetic-secret',fetchImpl:async(url,options)=>{calls.push({url,...options});return json(reply(protocol))}});
  assert.equal(calls.length,1);assert.equal(r.text,'{"suggestion":"继续"}');assert.equal(r.usage.inputTokens,1000);assert.equal(r.usage.cacheReadTokens,900);assert.equal(r.usage.status,'known');assert.equal(JSON.stringify(s),before);
  const body=JSON.parse(calls[0].body);assert.equal(body.stream,false);assert.equal(body.model,'model');assert.equal(body.reasoning,undefined);assert.equal(body.reasoning_effort,undefined);assert.equal(body.previous_response_id,undefined);assert.equal(body.prompt_cache_key,undefined);
  assert.match(calls[0].url,protocol==='responses'?/\/responses$/:protocol==='anthropic-messages'?/\/messages$/:/\/chat\/completions$/);
  if(protocol==='anthropic-messages'){assert.equal(calls[0].headers['x-api-key'],'synthetic-secret');assert.equal(calls[0].headers.authorization,undefined)}
  else assert.equal(calls[0].headers.authorization,'Bearer synthetic-secret');
 });
 test(protocol+': explicit quota is not confused with rate-limit and never falls back to another protocol',async()=>{
  let calls=0;const p={...profile(protocol),capabilities:{responseMode:'json'}};
  await assert.rejects(runTransport(p,snapshot(),'P',{credential:'key',fetchImpl:async()=>{calls++;return json({error:{code:'insufficient_quota',message:'quota empty'}},429)}}),e=>e.code==='QUOTA'&&e.quotaExplicit&&e.preGenerationRejection);
  assert.equal(calls,1);
 });
}
test('optional Responses hints are sent only when declared; native parent fields stay stable',()=>{
 const p=profile('responses'),s=snapshot();
 assert.equal(buildResponsesRequest(p,s,'P').body.prompt_cache_key,undefined);
 const configured={...p,capabilities:{cacheKey:true,cacheRetention:true,reasoning:true},cache:{prompt_cache_retention:'24h'}},a=buildResponsesRequest(configured,s,'P1').body,b=buildResponsesRequest(configured,s,'P2').body;
 assert.equal(a.prompt_cache_key,'s');assert.equal(a.prompt_cache_key,b.prompt_cache_key);assert.equal(a.reasoning.effort,'high');assert.equal(a.prompt_cache_retention,'24h');
 s.responsesBody={input:[],prompt_cache_key:'native-key',store:true};const native=buildResponsesRequest(p,s,'P').body;assert.equal(native.prompt_cache_key,'native-key');assert.equal(native.store,false);assert.equal(native.background,false);
});
test('strict history refuses opaque reasoning; explicit portable migration records it without mutating parent',()=>{
 const s=snapshot();s.options.messages[1].content.unshift({type:'reasoning',text:'private'});const before=JSON.stringify(s);
 assert.throws(()=>buildGenericRequest(profile('chat-completions'),s,'P'),e=>e.code==='UNSUPPORTED_HISTORY');
 const r=buildGenericRequest({...profile('chat-completions'),request:{historyMode:'portable-text'}},s,'P');assert.equal(r.migration.removed.reasoningBlocks,1);assert.equal(JSON.stringify(s),before);
});
for(const protocol of ['chat-completions','anthropic-messages']){
 test(protocol+': tool call/result pairs and prefix remain deterministic',()=>{
  const s=snapshot();s.options.tools=[{name:'read',parameters:{type:'object'}}];s.options.messages.push({role:'assistant',content:[{type:'tool-call',id:'c1',name:'read',arguments:'{}'}]},{role:'tool',toolCallId:'c1',content:[text('result')]});
  const a=buildGenericRequest(profile(protocol),s,'P1'),b=buildGenericRequest(profile(protocol),s,'P2');
  assert.deepEqual(a.body.messages.slice(0,-1),b.body.messages.slice(0,-1));assert.equal(a.body.tools.length,1);
  const bad=structuredClone(s);bad.options.messages.pop();assert.throws(()=>buildGenericRequest(profile(protocol),bad,'P'),/unresolved/);
  assert.throws(()=>buildGenericRequest({...profile(protocol),capabilities:{tools:false}},s,'P'),e=>e.code==='UNSUPPORTED_CAPABILITY');
 });
}
test('Messages cache control has stable parent breakpoint and priced write configuration; no changing tail mark',()=>{
 const p={...profile('anthropic-messages'),cache:{control:{type:'ephemeral',ttl:'5m'}}},r=buildGenericRequest(p,snapshot(),'changing P');
 assert.equal(r.body.system[0].cache_control.type,'ephemeral');assert.equal(r.body.messages.at(-2).content.at(-1).cache_control.type,'ephemeral');assert.equal(r.body.messages.at(-1).content[0].cache_control,undefined);
});
test('Chat max_completion_tokens and Messages bearer authentication are explicit options',async()=>{
 const p={...profile('chat-completions'),request:{maxTokens:42,maxTokenField:'max_completion_tokens'}},b=buildGenericRequest(p,snapshot(),'P').body;assert.equal(b.max_completion_tokens,42);assert.equal(b.max_tokens,undefined);
 await runTransport({...profile('anthropic-messages'),capabilities:{auth:'bearer'}},snapshot(),'P',{credential:'test',fetchImpl:async(_,o)=>{assert.equal(o.headers.authorization,'Bearer test');assert.equal(o.headers['x-api-key'],undefined);return json(reply('anthropic-messages'))}});
});
test('cache absence is unknown, cost is bounded using total tokens; no fabricated zero or duplicate reasoning bill',()=>{
 const u=normalizeUsage('chat-completions',{prompt_tokens:1000,completion_tokens:100,completion_tokens_details:{reasoning_tokens:20}}),q=quotePrice(book,at),c=priceUsage(u,q);
 assert.equal(u.cacheReadTokens,null);assert.equal(u.inputTokens,1000);assert.equal(c.status,'upper-bound');assert.equal(c.amount,.0031);assert.ok(Math.abs(c.lowerBoundAmount-.0008)<1e-12);assert.equal(c.cacheReadSavings,null);
 assert.equal(priceUsage(normalizeUsage('anthropic-messages',{input_tokens:100,output_tokens:10}),q).status,'unpriced');
 const totals=normalizeUsage('totals-only',{input_tokens:100,output_tokens:10});assert.equal(totals.inputTokens,100);assert.equal(totals.cacheReadTokens,null);
});
test('DeepSeek Chat native hit counters are used, but contradictory/negative counters stay invalid',()=>{
 const u=normalizeUsage('chat-completions',{prompt_tokens:1000,prompt_cache_hit_tokens:900,prompt_cache_miss_tokens:100,completion_tokens:20});assert.equal(u.status,'known');assert.equal(u.cacheReadTokens,900);
 assert.equal(normalizeUsage('chat-completions',{prompt_tokens:100,prompt_cache_hit_tokens:900,completion_tokens:20}).status,'unknown');
 assert.equal(normalizeUsage('chat-completions',{prompt_tokens:100,prompt_cache_hit_tokens:90,prompt_cache_miss_tokens:11,completion_tokens:20}).status,'unknown');
});
test('bounds persist in ledger and preserve interval shares and unknown aggregate cache hit',async()=>{
 const ledger=new UsageLedger({path:':memory:'}),u=normalizeUsage('responses',{input_tokens:1000,output_tokens:100}),q=quotePrice(book,at);
 await ledger.record({id:'a',profileId:'p',sourceSessionId:'s',startedAt:at,status:'completed',usage:u,quote:q});
 const a=ledger.aggregate();assert.equal(a.upperBoundAttempts,1);assert.equal(a.unpricedAttempts,0);assert.equal(a.tokens.input,1000);assert.equal(a.cacheHitRatio,null);assert.equal(a.currencies.USD.cacheSavingsUnknownAttempts,1);
 const share=costShare(a,{currencies:{USD:{amount:.01,lowerBoundAmount:.01}},unpricedAttempts:0});assert.equal(share.currencies.USD.predictionShare,null);const [low,high]=share.currencies.USD.predictionShareRange;assert.ok(low>0&&high>low&&high<1);ledger.close();
});
test('main pricing requires an exact explicit provider/model binding, never just a shared model name',()=>{
 const p={...profile('responses'),mainRoute:{provider:'gateway-1',model:'model'}};
 assert.equal(publicQuote([p],{provider:'gateway-1',model:'model'},at).versionId,'declared');
 assert.equal(publicQuote([p],{provider:'gateway-2',model:'model'},at),null);assert.equal(publicQuote([p,p],{provider:'gateway-1',model:'model'},at),null);
 assert.throws(()=>validateProfile({...p,mainRoute:{provider:'deepseek-official',model:'model'}}),/official/);
});
test('capability changes partition the result/cache identity; invalid capability declarations fail early',()=>{
 const p=profile('responses');assert.notEqual(profileCacheScope(p),profileCacheScope({...p,capabilities:{cacheKey:true}}));
 assert.throws(()=>validateProfile({...p,capabilities:{magic:true}}),/unknown capability/);
 assert.throws(()=>validateProfile({...p,capabilities:{auth:'magic'}}),/invalid auth/);
});
test('rate limit, authentication and context rejection cannot arm balance monitoring',()=>{
 for(const [status,error,code]of [[429,{type:'rate_limit_error'},'RATE_LIMIT'],[401,{type:'authentication_error'},'AUTH'],[400,{code:'context_length_exceeded'},'CONTEXT_LENGTH']]){
  const e=providerError(status,{error});assert.equal(e.code,code);assert.equal(e.quotaExplicit,undefined);
 }
 const quota=providerError(429,{error:{code:'insufficient_quota'}});assert.equal(classifyFailure(quota),'terminal');assert.equal(classifyFailure(providerError(429,{error:{type:'rate_limit_error'}})),'network');
 assert.equal(providerError(200,{error:{code:'insufficient_quota'}}).preGenerationRejection,undefined);
});
test('manual negative balance lookup does not arm or pause, and later event does not query',async()=>{
 let queries=0;const w=new BalanceWatchdog({resolveRoute:()=>({key:'a',supported:true}),probe:async()=>{queries++;return{available:false}}}),s=snapshot();
 await w.pulse({snapshot:s,checkpoint:'button',force:true});assert.equal(w.status(null,s).paused,false);await w.before({snapshot:s,trigger:'live'});await w.pulse({snapshot:s,checkpoint:'new-event'});assert.equal(queries,1);assert.deepEqual(w.pendingSessions(),[]);await w.close();
});
test('real success stops watchdog until another explicit rejection; unsupported routes never probe models',async()=>{
 let probes=0;const w=new BalanceWatchdog({resolveRoute:()=>({key:'a',supported:false}),probe:async()=>{probes++;return{available:true}}}),s=snapshot();
 w.rejected({snapshot:s,trigger:'live'});await w.pulse({snapshot:s,checkpoint:'event'});assert.equal(probes,0);await w.before({snapshot:s,trigger:'manual_retry'});w.succeeded({snapshot:s});await w.pulse({snapshot:s,checkpoint:'after-success'});assert.equal(w.status(null,s).paused,false);assert.equal(probes,0);await w.close();
});
function engineFixture(t,{protocol='chat-completions',fetchImpl}={}){
 const ledger=new UsageLedger({path:':memory:'}),p={...profile(protocol),capabilities:{responseMode:'json'}};
 const e=new PredictionEngine({enforceBilling:true,profiles:{current:()=>p,publicCurrent:()=>p,resolveCredential:async()=>'synthetic-key'},ledger,now:()=>Date.parse(at),run:(p,s,prompt,o)=>runTransport(p,s,prompt,{...o,fetchImpl}),config:{enabled:true},delay:async()=>{}});
 e.capture(snapshot());t.after(()=>e.dispose());return{e,ledger};
}
test('engine: explicit 429 quota is one accounted rejected attempt, pauses passive and leaves manual retry possible',async t=>{
 let calls=0,paused=0;const f=engineFixture(t,{fetchImpl:async()=>{calls++;return json({error:{code:'insufficient_quota'}},429)}});f.e.balanceWatchdog={before:async()=>{},rejected:()=>paused++};
 const r=await f.e.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.reason,'QUOTA');assert.equal(calls,1);assert.equal(paused,1);assert.equal(f.ledger.list()[0].cost.status,'not-billed');assert.equal(f.ledger.aggregate().unpricedAttempts,0);assert.equal(r.recovery.networkRetries,0);
});
test('engine: missing cache detail can show valid prediction with bounded cost, reused without another request',async t=>{
 let calls=0;const f=engineFixture(t,{fetchImpl:async()=>{calls++;const r=reply('chat-completions');delete r.usage.prompt_tokens_details;return json(r)}});
 const r=await f.e.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.suggestion,'继续');assert.equal(f.ledger.aggregate().upperBoundAttempts,1);await f.e.sample({sessionId:'s',expectedTurnId:1});assert.equal(calls,1);
});
test('engine: absent usage does not trigger a compatibility retry or second charge',async t=>{
 let calls=0;const f=engineFixture(t,{fetchImpl:async()=>{calls++;const r=reply('chat-completions');delete r.usage;return json(r)}});
 const r=await f.e.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.reason,'BILLING_UNRECONCILED');assert.equal(calls,1);assert.equal(f.ledger.aggregate().unpricedAttempts,1);
});
test('engine: locally unsupported history is a zero-dispatch record, not an unknown charged request',async t=>{
 let calls=0;const f=engineFixture(t,{fetchImpl:async()=>{calls++;return json(reply('chat-completions'))}}),s=snapshot();s.revision='r2';s.options.messages[0].content=[{type:'image',attachment:{attachmentId:'native'}}];f.e.capture(s);
 const r=await f.e.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.reason,'UNSUPPORTED_HISTORY');assert.equal(calls,0);assert.equal(f.ledger.aggregate().unpricedAttempts,0);assert.equal(f.ledger.aggregate().notDispatchedAttempts,1);
});

test('HTTP rejection body with observed usage cannot be marked free, including error envelopes',async()=>{
 let observed;await assert.rejects(runTransport({...profile('chat-completions')},snapshot(),'P',{credential:'test',onUsage:u=>observed=u,fetchImpl:async()=>json({error:{code:'insufficient_quota'},usage:{prompt_tokens:10,prompt_tokens_details:{cached_tokens:0},completion_tokens:1}},429)}),e=>e.code==='QUOTA'&&!e.preGenerationRejection);
 assert.equal(observed.outputTokens,1);
});
test('plain text and string error envelopes recognize explicit insufficient balance without retaining remote prose',async()=>{
 for(const response of [new Response('Insufficient balance for this account',{status:402}),json({error:'余额不足'},403)]){
  await assert.rejects(runTransport(profile('chat-completions'),snapshot(),'P',{credential:'test',fetchImpl:async()=>response}),e=>e.code==='QUOTA'&&e.quotaExplicit&&e.preGenerationRejection&&!e.message.includes('this account'));
 }
});
test('custom official-adapter endpoint cannot accidentally use official prices',()=>{
 const official={...profile('responses'),model:'deepseek-flash'};
 assert.equal(publicQuote([official],{provider:'deepseek-official',model:'deepseek-flash',baseURL:'https://gateway.example/v1'},at),null);
 const explicit={...official,mainRoute:{provider:'deepseek-official',model:'deepseek-flash',baseURL:'https://gateway.example/v1'}};
 assert.equal(publicQuote([explicit],{...explicit.mainRoute},at).versionId,'declared');
});

import {createServer} from 'node:http';
import {mountHost,completedSession} from './support/mount-host.mjs';
test('native main normal success disarms balance monitoring without a balance endpoint query',async t=>{
 const h=await mountHost(t),{session}=await completedSession(h),options={sessionId:session.id,provider:'deepseek-official',model:'deepseek-flash'};
 let probes=0;h.controller.balanceWatchdog.probe=async()=>{probes++;return{available:true}};
 h.controller.balanceWatchdog.rejected({profile:null,snapshot:{sessionId:session.id,options},trigger:'manual_retry'});
 const stream=async function*(){yield{type:'text-delta',index:0,text:'完成'};yield{type:'usage',usage:{inputTokens:10,cacheReadTokens:90,outputTokens:2}};yield{type:'finish',reason:{kind:'stop'}}};
 for await(const _ of h.controller.trackMain(options,stream())){}
 assert.equal(h.controller.balanceWatchdog.status(null,{options}).paused,false);assert.equal(probes,0);
});
for(const protocol of ['responses','anthropic-messages','chat-completions']){
 test(protocol+': real loopback HTTP serialization and final response ingestion (synthetic, no external API)',async t=>{
  const requests=[],server=createServer(async(req,res)=>{let data='';for await(const chunk of req)data+=chunk;requests.push({path:req.url,headers:req.headers,body:JSON.parse(data)});res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(reply(protocol)))});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
  const p={...profile(protocol),baseURL:'http://127.0.0.1:'+server.address().port+'/v1',capabilities:{responseMode:'json'}};
  const result=await runTransport(p,snapshot(),'P',{credential:'synthetic-loopback'});assert.equal(requests.length,1);assert.equal(result.usage.status,'known');assert.equal(requests[0].body.stream,false);
  assert.equal(requests[0].path,'/v1/'+(protocol==='responses'?'responses':protocol==='anthropic-messages'?'messages':'chat/completions'));
 });
}
test('negative cache counters are rejected rather than made into a missing-cache estimate',()=>{
 const u=normalizeUsage('responses',{input_tokens:100,input_tokens_details:{cached_tokens:-1},output_tokens:10});assert.equal(u.status,'unknown');assert.equal(priceUsage(u,quotePrice(book,at)).status,'unpriced');
});

import {digest} from '../src/core/profiles.mjs';
test('unchanged official profiles retain their original cache scope across this upgrade',()=>{
 const p=profile('deepseek-messages'),parentConfig={model:'same'};
 const legacy=digest({profileId:p.id,protocol:p.protocol,endpoint:p.baseURL,accountId:p.accountId,credential:p.credential,model:p.model,request:p.request,cache:p.cache,parentConfig});
 assert.equal(profileCacheScope(p,parentConfig),legacy);
});

import {collectDSHStream} from '../src/core/transports.mjs';
test('native quota after visible generation is never classified as a free pre-generation rejection',async()=>{
 const stream=async function*(){yield{type:'text-delta',index:0,text:'partial'};yield{type:'finish',reason:{kind:'error',failure:{code:'QUOTA',status:402}}}};
 await assert.rejects(collectDSHStream(stream()),e=>e.code==='QUOTA'&&e.generationObserved===true&&e.preGenerationRejection===false);
});
test('real quota with billable usage still pauses passive predictions and retains its charge',async t=>{
 let pauses=0;const f=engineFixture(t,{fetchImpl:async()=>json({error:{code:'insufficient_quota'},usage:{prompt_tokens:100,prompt_tokens_details:{cached_tokens:0},completion_tokens:3}},429)});
 f.e.balanceWatchdog={before:async()=>{},rejected:()=>pauses++};const r=await f.e.sample({sessionId:'s',expectedTurnId:1});
 assert.equal(r.reason,'QUOTA');assert.equal(pauses,1);assert.equal(f.ledger.list()[0].cost.status,'priced');assert.ok(f.ledger.list()[0].cost.amount>0);
});
test('native partial generation with missing usage stays unreconciled instead of zero-priced',async t=>{
 const ledger=new UsageLedger({path:':memory:'}),stream=async function*(){yield{type:'text-delta',index:0,text:'partial'};yield{type:'finish',reason:{kind:'error',failure:{code:'QUOTA',status:402}}}};
 let pauses=0;const e=new PredictionEngine({enforceBilling:true,ledger,profiles:{current:()=>null,publicCurrent:()=>null},quoteForParent:()=>quotePrice(book,at),now:()=>Date.parse(at),parentRun:()=>collectDSHStream(stream()),balanceWatchdog:{before:async()=>{},rejected:()=>pauses++},config:{enabled:true}});
 e.capture(snapshot());t.after(()=>e.dispose());const r=await e.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.reason,'BILLING_UNRECONCILED');assert.equal(pauses,1);assert.equal(ledger.list()[0].cost.status,'unpriced');
});

test('an unreadable HTTP error body is not guessed to be a free rejection',()=>{
 const e=providerError(429,undefined);assert.equal(e.preGenerationRejection,undefined);
});

test('Responses gateways may explicitly choose x-api-key without also leaking a Bearer header',async()=>{
 await runTransport({...profile('responses'),capabilities:{responseMode:'json',auth:'x-api-key'}},snapshot(),'P',{credential:'synthetic',fetchImpl:async(_,options)=>{assert.equal(options.headers['x-api-key'],'synthetic');assert.equal(options.headers.authorization,undefined);return json(reply('responses'))}});
});
