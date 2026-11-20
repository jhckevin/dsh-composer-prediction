import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareMinimumReasoning,preparePredictionReasoning,validateReasoningControl} from '../src/core/reasoning-policy.mjs';
import {buildResponsesRequest,buildGenericRequest,runTransport} from '../src/core/transports.mjs';
import {profileCacheScope} from '../src/core/profiles.mjs';
import {PredictionEngine} from '../src/core/engine.mjs';
import {normalizeUsage} from '../src/core/billing.mjs';
const snapshot=()=>({sessionId:'s',turnId:1,revision:'r',contextWindow:8192,parentConfig:{reasoningEffort:'high'},options:{provider:'p',model:'m',reasoningEffort:'high',temperature:0.5,maxTokens:2048,messages:[{role:'user',content:[{type:'text',text:'你好'}]}]}});
const profile=(protocol,model,extra={})=>({id:'p',protocol,model,baseURL:'https://third.example/v1',request:{},...extra});
for(const [model,expected] of [['gpt-5','minimal'],['gpt-5-mini','minimal'],['gpt-5.1','none'],['gpt-5.5','none'],['gpt-5-pro','high'],['gpt-5.2-pro','medium'],['gpt-6-astra','low'],['gpt-6.1-sol','low']])for(const protocol of ['responses','chat-completions'])test(`${protocol} ${model} selects ${expected}`,async()=>{
 const s=snapshot(),p=profile(protocol,model,{request:{reasoning:{effort:'high'},reasoning_effort:'high'}}),before=JSON.stringify({s,p});
 const plan=await prepareMinimumReasoning({profile:p,snapshot:s});
 const body=protocol==='responses'?buildResponsesRequest(plan.profile,plan.snapshot,'predict').body:buildGenericRequest(plan.profile,plan.snapshot,'predict').body;
 assert.equal(protocol==='responses'?body.reasoning.effort:body.reasoning_effort,expected);assert.equal(body.temperature,undefined);
 assert.equal(JSON.stringify({s,p}),before);assert.notEqual(profileCacheScope(p),profileCacheScope(plan.profile));
});
for(const [model,type,effort] of [['claude-sonnet-5-5','between_tools','low'],['claude-opus-5-5','adaptive','low'],['claude-haiku-5-5','disabled','low'],['claude-opus-5','disabled','low'],['claude-fable-5-2','adaptive','low'],['claude-opus-4-8','disabled',undefined],['claude-sonnet-4-5-20250929','disabled',undefined]])test(`Messages ${model} minimum`,async()=>{
 const s=snapshot(),p=profile('anthropic-messages',model,{request:{thinking:{type:'enabled',budget_tokens:1600},output_config:{effort:'high'}}});const plan=await prepareMinimumReasoning({profile:p,snapshot:s});
 const {body}=buildGenericRequest(plan.profile,plan.snapshot,'predict');assert.equal(body.thinking.type,type);assert.equal(body.output_config?.effort,effort);assert.equal(body.temperature,undefined);assert.equal(s.options.reasoningEffort,'high');
});
test('DeepSeek native independent adapter explicitly receives off, parent history preserved',async()=>{
 const s=snapshot(),p=profile('deepseek-messages','deepseek-flash',{request:{reasoningEffort:'high'}}),plan=await prepareMinimumReasoning({profile:p,snapshot:s});let actual;
 await runTransport(plan.profile,plan.snapshot,'predict',{credential:'test-only',deepSeekModule:{resolveAdapterOptions:x=>x,DeepSeekAdapter:class{constructor(){} async *stream(o){actual=o;yield{type:'finish',reason:{kind:'stop'}}}}}});
 assert.equal(actual.reasoningEffort,'off');assert.deepEqual(actual.messages.slice(0,-1),s.options.messages);assert.equal(s.options.reasoningEffort,'high');
});
for(const protocol of ['responses','chat-completions'])test('official DeepSeek '+protocol+' disables thinking',async()=>{
 const plan=await prepareMinimumReasoning({profile:profile(protocol,'deepseek-flash',{baseURL:'https://api.deepseek.com/v1'}),snapshot:snapshot()});
 const {body}=protocol==='responses'?buildResponsesRequest(plan.profile,plan.snapshot,'predict'):buildGenericRequest(plan.profile,plan.snapshot,'predict');
 if(protocol==='responses')assert.equal(body.reasoning.effort,'none');else{assert.deepEqual(body.thinking,{type:'disabled'});assert.equal(body.reasoning_effort,undefined)}
});
test('native metadata order is authoritative and off wins; no synthetic effort on no-control adapters',async()=>{
 for(const [ids,expected] of [[['low','high'],'low'],[['minimal','low'],'minimal'],[['high'],'high'],[['low','off','high'],'off'],[[],undefined]]){
  const s=snapshot(),plan=await prepareMinimumReasoning({snapshot:s,resolveModelInfo:async()=>({reasoning:ids.length?{efforts:ids.map(id=>({id}))}:undefined})});
  assert.equal(plan.snapshot.options.reasoningEffort,expected);assert.equal(s.options.reasoningEffort,'high');
 }
});
test('unknown aliases require declared controls, never a paid parameter probe',async()=>{
 await assert.rejects(prepareMinimumReasoning({profile:profile('responses','alias'),snapshot:snapshot()}),e=>e.code==='REASONING_CAPABILITY_REQUIRED'&&e.notDispatched);
 const plan=await prepareMinimumReasoning({profile:profile('responses','alias',{reasoningControl:{efforts:['high','low','none']}}),snapshot:snapshot()});assert.equal(plan.profile.request.reasoning.effort,'none');
 const no=await prepareMinimumReasoning({profile:profile('responses','alias',{capabilities:{reasoning:false}}),snapshot:{...snapshot(),responsesBody:{input:[],reasoning:{effort:'high'}}}});assert.equal(no.snapshot.responsesBody.reasoning,undefined);assert.equal(no.decision.disabled,false,'no parameter support does not prove that thinking is off');
 assert.throws(()=>validateReasoningControl({efforts:['off']}));assert.throws(()=>validateReasoningControl({nonReasoning:true,efforts:['none']}));
});
test('native Responses replay cannot smuggle inherited high back in',async()=>{
 const s={...snapshot(),responsesBody:{input:[],reasoning:{effort:'high',summary:'auto'},output_config:{effort:'high'},temperature:1}},plan=await prepareMinimumReasoning({profile:profile('responses','gpt-5.1'),snapshot:s});
 const {body}=buildResponsesRequest(plan.profile,plan.snapshot,'predict');assert.deepEqual(body.reasoning,{effort:'none'});assert.equal(body.output_config,undefined);assert.equal(s.responsesBody.reasoning.effort,'high');
});
test('legacy mandatory thinking checks minimum budget without increasing output cap',async()=>{
 const p=profile('anthropic-messages','legacy',{reasoningControl:{thinkingModes:['enabled'],minimumBudgetTokens:1024},request:{maxTokens:512}});
 await assert.rejects(prepareMinimumReasoning({profile:p,snapshot:snapshot()}),e=>e.notDispatched);
 p.request.maxTokens=2048;const plan=await prepareMinimumReasoning({profile:p,snapshot:snapshot()});assert.deepEqual(plan.profile.request.thinking,{type:'enabled',budget_tokens:1024});
});
test('prediction and draft-only repair stay off, validate original lifecycle and do not duplicate',async()=>{
 const entries=[],calls=[],ledger={begin:async()=>{},record:async e=>entries.push(e),close:async()=>{}},profiles={current:()=>null,publicCurrent:()=>null};let e,source;
 e=new PredictionEngine({profiles,ledger,prepareReasoning:args=>prepareMinimumReasoning({...args,resolveModelInfo:async()=>({reasoning:{efforts:[{id:'off'},{id:'high'}]}})}),validateSnapshot:s=>s===source,parentRun:async(p,s)=>{calls.push(s);return{text:calls.length===1?'invalid':'{"suggestion":"继续"}',usage:normalizeUsage('deepseek-messages',{input_tokens:1,cache_read_input_tokens:0,output_tokens:2})}},config:{enabled:true,repairStrategy:'draft-only'}});
 source=e.capture(snapshot());const result=await e.sample({sessionId:'s',expectedTurnId:1});assert.equal(result.suggestion,'继续');assert.equal(calls.length,2);assert.ok(calls.every(s=>s.options.reasoningEffort==='off'));assert.equal(calls[1].options.messages.length,0);assert.ok(entries.every(x=>JSON.parse(x.reasoningPolicy).effort==='off'));assert.equal(source.options.reasoningEffort,'high');await e.sample({sessionId:'s',expectedTurnId:1});assert.equal(calls.length,2);await e.dispose();
});
test('Claude thinking token detail is a subset of output, never charged twice',()=>{
 const u=normalizeUsage('anthropic-messages',{input_tokens:5,cache_read_input_tokens:8,output_tokens:10,output_tokens_details:{thinking_tokens:3}});assert.equal(u.outputTokens,10);assert.equal(u.reasoningTokens,3);assert.equal(u.inputTokens,13);
});
test('unrecognized direct model is rejected locally with zero physical calls and zero ledger entries',async()=>{
 const p=profile('responses','unknown-alias'),entries=[],calls=[];
 const e=new PredictionEngine({profiles:{current:()=>p,publicCurrent:()=>p,resolveCredential:async()=>undefined},ledger:{begin:async()=>{},record:async x=>entries.push(x),close:async()=>{}},prepareReasoning:prepareMinimumReasoning,run:async(...x)=>{calls.push(x);throw Error('must not run')},config:{enabled:true}});e.capture(snapshot());
 const r=await e.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.reason,'REASONING_CAPABILITY_REQUIRED');assert.equal(calls.length,0);assert.equal(entries.length,0);assert.equal(r.recovery.physicalAttempts,0);assert.equal(r.recovery.networkRetries,0);await e.dispose();
});

test('minimum default and explicit configured mode preserve custom controls',async()=>{
 const s=snapshot(),p=profile('responses','alias',{request:{reasoning:{effort:'high'}}});
 const a=await preparePredictionReasoning({snapshot:s,resolveModelInfo:async()=>({reasoning:{efforts:[{id:'off'},{id:'high'}]}})});
 assert.equal(a.snapshot.options.reasoningEffort,'off');
 const before=JSON.stringify({s,p}),b=await preparePredictionReasoning({mode:'configured',snapshot:s,profile:p});
 assert.equal(b.snapshot.options.reasoningEffort,'high');assert.equal(b.profile.request.reasoning.effort,'high');assert.equal(b.decision.mode,'configured');assert.equal(b.decision.disabled,false);assert.equal(JSON.stringify({s,p}),before);
 await assert.rejects(preparePredictionReasoning({mode:'typo',snapshot:s}),e=>e.notDispatched);
});

test('beta2 minimum result keys remain reusable after configurable-mode upgrade',async()=>{
 let calls=0;const cache=new Map(),e=new PredictionEngine({profiles:{current:()=>null},ledger:{close:async()=>{}},parentRun:async()=>{calls++;throw Error('No paid regeneration allowed')},resultCache:cache,config:{enabled:true}});
 const s=e.capture(snapshot()),i=e.identity(s),legacy={...e.config};delete legacy.reasoningMode;
 const oldKey=createHash('sha256').update(JSON.stringify({cacheSchema:3,scope:i.scope,revision:s.revision,turn:s.turnId,config:legacy})).digest('hex');
 assert.equal(i.key,oldKey);cache.set(oldKey,{key:oldKey,suggestion:'继续',status:'ready',canRetry:false});
 assert.equal((await e.sample({sessionId:'s',expectedTurnId:1})).suggestion,'继续');
 e.configure({reasoningMode:'configured'});assert.notEqual(e.identity(s).key,oldKey);
 e.configure({reasoningMode:'minimum'});assert.equal((await e.sample({sessionId:'s',expectedTurnId:1})).suggestion,'继续');assert.equal(calls,0);await e.dispose();
});
