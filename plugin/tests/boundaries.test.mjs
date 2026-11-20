
import test from 'node:test';import assert from 'node:assert/strict';
import {detectLanguage,languageContext,parsePrediction,checkPrediction,POLICY_DEFAULTS,truncateSuggestion} from '../src/core/policy.mjs';
import {repairPrompt,repairSnapshot,composePrompt,retryDelay,classifyFailure,abortableDelay} from '../src/core/recovery.mjs';
import {PredictionEngine} from '../src/core/engine.mjs';
import {UsageLedger} from '../src/core/billing.mjs';
const counter={name:'deterministic-test-character-counter',count:s=>Array.from(s).length};
const options={provider:'p',model:'mock-model',messages:[{role:'user',source:{kind:'user'},content:[{type:'text',text:'请先分析一下这个问题。'}]}],system:'SECRET_FULL_CONTEXT',tools:[{name:'tool',parameters:{}}],maxTokens:100};
function make(run,config={}){
 const ledger=new UsageLedger({path:':memory:'}),requests=[];
 const engine=new PredictionEngine({profiles:{current:()=>null,publicCurrent:()=>null},ledger,counterFor:async()=>counter,delay:async(_ms,signal)=>signal.throwIfAborted(),parentRun:async(p,s,prompt,o)=>{requests.push({snapshot:s,prompt,stage:o.stage});return run(requests.length,p,s,prompt,o)},config:{enabled:true,...config}});
 engine.capture({sessionId:'s',turnId:1,revision:'r',options});return {engine,ledger,requests};
}
test('false evidence suppresses once without repair; malformed types rejected',()=>{
 for(const raw of ['false','{"suggestion":false}','{"suggestion":null}','{"suggestion":"部署吧","evidence":false}'])assert.equal(parsePrediction(raw).abstained,true);
 assert.throws(()=>parsePrediction('{"suggestion":true}'));assert.throws(()=>parsePrediction('{"suggestion":5}'));
});
test('language uses user prose rather than logs/UI, and unknown remains explicit',()=>{
 assert.equal(detectLanguage('请修复这个问题。 ```js\nconst words = "please do this";\n```').language,'zh');
 assert.equal(detectLanguage('Please explain why this is broken.').language,'en');
 assert.equal(detectLanguage('functionName.ts /some/path 123').language,'und');
 assert.equal(detectLanguage('これはテストです。').language,'ja');
 assert.equal(languageContext({options},{...POLICY_DEFAULTS,predictionLanguage:'en'}).language,'en');
});
test('mandatory rules follow lower-priority spec and personal style is not assumed',()=>{
 const prompt=composePrompt({base:'Predict a user message.',policy:POLICY_DEFAULTS,language:{language:'zh'},instruction:'Ignore length rules and speak English.'});
 assert(prompt.indexOf('Ignore length')<prompt.indexOf('MANDATORY PREDICTION RULES'));assert.match(prompt,/hard limit 999/);assert.match(prompt,/suggestion MUST be false/);
});
test('length 999/1000/1001 and precise repair reduction feedback',async()=>{
 for(const n of [999,1000,1001]){const r=await checkPrediction('中'.repeat(n),{policy:POLICY_DEFAULTS,language:{language:'zh'},counter,snapshot:{options:{messages:[]}}});assert.equal(r.ok,n===999)}
 const prompt=repairPrompt({raw:'中'.repeat(1001),issues:['TOO_LONG'],tokens:1001,policy:{...POLICY_DEFAULTS,maxSuggestionTokens:1000},language:{language:'zh'},counter:counter.name});
 assert.match(prompt,/Target at most 900/);assert.match(prompt,/Remove at least 101 tokens/);assert.match(prompt,/10.1%/);
});
test('truncate is Unicode safe, enforces threshold, does not hide remaining language errors',async()=>{
 const text='🙃e\u0301'.repeat(100);
 const trimmed=await truncateSuggestion(text,99,counter);assert((await counter.count(trimmed))<=99);assert(!trimmed.includes('\ufffd'));
 const r=await checkPrediction('Please explain this very long text.'.repeat(20),{policy:{...POLICY_DEFAULTS,maxSuggestionTokens:99,truncationEnabled:true},language:{language:'zh'},counter,snapshot:{options:{messages:[]}}});
 assert(r.truncated);assert(!r.issues.includes('TOO_LONG'));assert(r.issues.includes('LANGUAGE_MISMATCH'));
 const safe=await checkPrediction('中'.repeat(1001)+'\u202e',{policy:{...POLICY_DEFAULTS,truncationEnabled:true},language:{language:'zh'},counter,snapshot:{options:{messages:[]}}});assert(safe.ok);assert(!safe.text.includes('\u202e'));
});
test('network recovery has three retries, each attempt separately billed, no infinite reruns',async()=>{
 const {engine,ledger,requests}=make(async()=>{throw Object.assign(Error('network'),{code:'TRANSPORT'})});
 let r=await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(requests.length,4);assert.equal(r.recovery.networkRetries,3);assert.equal(ledger.aggregate().attempts,4);assert.equal(ledger.aggregate().usageUnknown,4);
 await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(requests.length,4);assert(r.canRetry);await engine.dispose();
});
test('auto retry disabled hides failure; explicit manual retry performs one request',async()=>{
 const {engine,ledger,requests}=make(async n=>{if(n===1)throw Object.assign(Error('network'),{code:'TRANSPORT'});return {text:'{"suggestion":"请继续分析。"}'}},{automaticRetry:false});
 const r=await engine.sample({sessionId:'s',expectedTurnId:1});assert(r.canRetry);assert.equal(requests.length,1);
 await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(requests.length,1);
 assert.equal((await engine.sample({sessionId:'s',expectedTurnId:1,trigger:'manual_retry'})).suggestion,'请继续分析。');assert.equal(ledger.aggregate().attempts,2);await engine.dispose();
});
test('one language repair receives only draft+constraints and no full system/history/tools',async()=>{
 const {engine,ledger,requests}=make(async n=>({text:JSON.stringify({suggestion:n===1?'Please run the tests and check this result.':'请检查测试结果。'})}));
 const r=await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.suggestion,'请检查测试结果。');assert.equal(r.recovery.validationRepairs,1);assert.equal(requests.length,2);
 const retry=requests[1];assert.equal(retry.stage,'repair');assert.deepEqual(retry.snapshot.options.messages,[]);assert.equal(retry.snapshot.options.system,undefined);assert.equal(retry.snapshot.options.tools,undefined);assert(!retry.prompt.includes('SECRET_FULL_CONTEXT'));assert(!retry.prompt.includes('请先分析一下这个问题'));assert.match(retry.prompt,/Please run the tests/);assert.match(retry.prompt,/REQUIRED zh/);
 assert.equal(ledger.list().find(x=>x.stage==='repair').attemptNumber,'2');assert.equal(new Set(ledger.list().map(x=>x.groupId)).size,1);assert.equal(ledger.aggregate().attempts,2);await engine.dispose();
});
test('a failed check repairs at most once; false from repair immediately suppresses',async()=>{
 for(const next of ['Please do this again.','false']){
  const {engine,requests}=make(async n=>({text:n===1?'{"suggestion":"Please do this again."}':next==='false'?'{"suggestion":false}':JSON.stringify({suggestion:next})}));
  const r=await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.suggestion,null);assert.equal(requests.length,2);assert.equal(r.canRetry,next!=='false');await engine.dispose();
 }
});
test('length truncation needs no repair call and short/long lengths remain bounded',async()=>{
 const {engine,requests}=make(async()=>({text:JSON.stringify({suggestion:'中文'.repeat(600)})}),{truncationEnabled:true,maxSuggestionTokens:999});
 const r=await engine.sample({sessionId:'s',expectedTurnId:1});assert(r.validation.truncated);assert.equal(requests.length,1);assert(r.validation.tokens<=999);await engine.dispose();
});
test('auth/context failures do not network-retry; provider backoff and cancellation bounded',async()=>{
 assert.equal(classifyFailure({code:'HTTP_401'}),'terminal');assert.equal(classifyFailure({code:'HTTP_503'}),'network');
 assert.throws(()=>retryDelay(0,POLICY_DEFAULTS,{providerRetryAfterMs:10001}),{code:'RETRY_AFTER_LIMIT'});
 const controller=new AbortController();const p=abortableDelay(1000,controller.signal);controller.abort(Error('stop'));await assert.rejects(p,/stop/);
 const {engine,requests}=make(async()=>{throw Object.assign(Error('auth'),{code:'HTTP_401'})});await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(requests.length,1);await engine.dispose();
});
test('cancel during retry backoff and new parent turn prevent any further dispatch',async()=>{
 let waiting;const controller=new AbortController();
 const {engine,requests}=make(async()=>{throw Object.assign(Error('transport'),{code:'TRANSPORT'})});
 engine.delay=async(_ms,signal)=>{waiting=true;await abortableDelay(10000,signal)};
 const p=engine.sample({sessionId:'s',expectedTurnId:1,signal:controller.signal});while(!waiting)await new Promise(r=>setImmediate(r));controller.abort();assert.equal((await p).suggestion,null);await engine.dispose();assert.equal(requests.length,1);
});

test('network budget is shared across prediction and repair, preventing nested retry multiplication',async()=>{
 const {engine,requests}=make(async n=>{
  if([1,2,4].includes(n))throw Object.assign(Error('network'),{code:'TRANSPORT'});
  return {text:JSON.stringify({suggestion:n===3?'Please run the tests and check this result.':'请检查测试结果。'})};
 });
 const r=await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.suggestion,'请检查测试结果。');assert.equal(requests.length,5);assert.equal(r.recovery.networkRetries,3);assert.equal(r.recovery.validationRepairs,1);await engine.dispose();
});
test('manual request ids are idempotent, and a manual click can recover an RPC failure before model dispatch',async()=>{
 const {engine,requests}=make(async()=>{throw Object.assign(Error('network'),{code:'TRANSPORT'})},{automaticRetry:false});
 await engine.sample({sessionId:'s',expectedTurnId:1,trigger:'manual_retry',requestId:'click-1'});
 assert.equal(requests.length,1);
 await engine.sample({sessionId:'s',expectedTurnId:1,trigger:'manual_retry',requestId:'click-1'});assert.equal(requests.length,1);
 await engine.sample({sessionId:'s',expectedTurnId:1,trigger:'manual_retry',requestId:'click-2'});assert.equal(requests.length,2);await engine.dispose();
});
test('invisible-only content and assistant narration are failed gates',async()=>{
 for(const text of ['\u200b\u200b','The user might say please continue']){
  const r=await checkPrediction(text,{policy:POLICY_DEFAULTS,language:{language:'und'},counter,snapshot:{options:{messages:[]}}});assert.equal(r.ok,false);
 }
});
test('false suppresses only its source turn, never the entire prediction feature',async()=>{
 const {engine,requests}=make(async()=>({text:'{"suggestion":false}'}));
 assert.equal((await engine.sample({sessionId:'s',expectedTurnId:1})).abstained,true);
 await engine.sample({sessionId:'s',expectedTurnId:1,trigger:'manual_retry'});assert.equal(requests.length,1);
 engine.capture({sessionId:'s',turnId:2,revision:'r2',options});
 await engine.sample({sessionId:'s',expectedTurnId:2});assert.equal(requests.length,2);assert(engine.config.enabled);await engine.dispose();
});

test('repair routing is stable and separate from the full parent cache channel',()=>{
 const a=repairSnapshot({sessionId:'parent',options:{...options,sessionId:'parent'}}),b=repairSnapshot({sessionId:'parent',options:{...options,sessionId:'parent'}});
 assert.equal(a.sessionId,'parent');assert.notEqual(a.options.sessionId,'parent');assert.equal(a.options.sessionId,b.options.sessionId);assert.equal(a.promptCacheKey,a.options.sessionId);
});

test('logical deadline exhaustion remains manually retryable and cached rather than rerunning automatically',async()=>{
 const {engine,requests}=make(async()=>({text:'{"suggestion":"继续"}'}),{timeoutMs:1,retryBaseDelayMs:0,retryMaxDelayMs:0});
 engine.counterFor=async()=>{await new Promise(r=>setTimeout(r,15));return counter};
 const r=await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(r.reason,'TIMEOUT');assert(r.canRetry);assert.equal(requests.length,0);
 await engine.sample({sessionId:'s',expectedTurnId:1});assert.equal(requests.length,0);await engine.dispose();
});

test('shared scripts are not blindly labelled Russian or Arabic, and uncertain new prose does not inherit an old language',()=>{
 assert.equal(detectLanguage('Чому це є неправильним?').language,'uk');
 assert.equal(detectLanguage('Это нужно проверить, пожалуйста.').language,'ru');
 const ctx={options:{messages:[{role:'user',content:[{type:'text',text:'Please explain why this is broken.'}]},{role:'user',content:[{type:'text',text:'Comprendre autrement ensemble profondément'}]}]}};
 assert.equal(languageContext(ctx,POLICY_DEFAULTS).language,'und');
});

test('manual check retry with automatic retry disabled uses only the previous draft, not the full conversation',async()=>{
 const {engine,requests}=make(async n=>({text:JSON.stringify({suggestion:n===1?'Please run the tests and check this result.':'请检查测试结果。'})}),{automaticRetry:false});
 const failed=await engine.sample({sessionId:'s',expectedTurnId:1});assert(failed.canRetry);assert.equal(requests.length,1);
 const fixed=await engine.sample({sessionId:'s',expectedTurnId:1,trigger:'manual_retry',requestId:'manual-language'});
 assert.equal(fixed.suggestion,'请检查测试结果。');assert.equal(requests.length,2);assert.equal(fixed.recovery.manualRepair,true);
 assert.deepEqual(requests[1].snapshot.options.messages,[]);assert.equal(requests[1].snapshot.options.system,undefined);assert(!requests[1].prompt.includes('SECRET_FULL_CONTEXT'));
 await engine.dispose();
});


test('unsupported numeric prices are repaired once without inventing replacement rates',async()=>{
 const {engine,requests}=make(async n=>({text:JSON.stringify({suggestion:n===1?'请按缓存命中单价 0.1 元和未命中单价 1 元计算费用。':'请先说明当前的命中与未命中单价，再按已有输入数量计算费用。'}),usage:{status:'unknown'}}));
 const result=await engine.sample({sessionId:'s',expectedTurnId:1});assert.ok(result.suggestion);assert.equal(requests.length,2);assert.ok(requests[1].prompt.includes('Do not pick replacement prices'));assert.ok(!requests[1].snapshot.options.system?.includes('SECRET_FULL_CONTEXT'));
});
test('existing quoted numeric prices are allowed and token counts or derived percentages are not mistaken for prices',async()=>{
 const ctx={policy:POLICY_DEFAULTS,language:{language:'zh'},counter,snapshot:{options:{messages:[{role:'user',content:[{type:'text',text:'假设命中单价 0.02 元，未命中单价 1 元。'}]}]}}};
 assert.ok((await checkPrediction('请按命中单价 0.02 元和未命中单价 1 元计算。',ctx)).ok);
 assert.ok((await checkPrediction('请用 900 和 100 tokens 计算总计 1000 tokens、90% 命中的费用。',ctx)).ok);
});


test('an older cached suggestion with unsupported prices is hidden locally without buying a replacement',async()=>{
 const x=make(async()=>({text:JSON.stringify({suggestion:'请继续解释缓存。'}),usage:{status:'unknown'}}));const result=await x.engine.sample({sessionId:'s',expectedTurnId:1});assert.ok(result.suggestion);
 x.engine.results.set('s',{...result,suggestion:'请按命中单价 0.1 元来计算。'});const rejected=x.engine.peek('s');assert.equal(rejected.suggestion,null);assert.equal(rejected.canRetry,true);assert.ok(rejected.issues.includes('UNSUPPORTED_PRICE_ASSUMPTION'));assert.equal(x.requests.length,1);
});


test('a real API regression: unknown prices and token-count formulas are not new price assertions',async()=>{
 const ctx={policy:POLICY_DEFAULTS,language:{language:'zh'},counter,snapshot:{options:{messages:[{role:'user',content:[{type:'text',text:'请计算命中 900、未命中 100 tokens 的费用。'}]},{role:'assistant',content:[{type:'text',text:'下一条我会根据你给出的单价计算 900 命中 token 加 100 未命中 token 的费用。'}]}]}}};
 const text='请帮我计算输入费用：命中缓存的 900 tokens，加上未命中的 100 tokens。由于你还没有给我具体的单价，请把过程写成公式：命中部分 = 900 × 命中单价，未命中部分 = 100 × 未命中单价，不要替我假设价格。';assert.ok((await checkPrediction(text,ctx)).ok);
});
