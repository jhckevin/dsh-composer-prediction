import test from 'node:test';import assert from 'node:assert/strict';
import {RecoverySelector} from '../src/core/recovery-selector.mjs';
import {POLICY_DEFAULTS,validatePolicy} from '../src/core/policy.mjs';
import {PredictionEngine} from '../src/core/engine.mjs';import {UsageLedger,normalizeUsage} from '../src/core/billing.mjs';
const now=Date.parse('2026-11-12T03:00:00Z');
const counter={name:'exact-unit-fixture',exact:true,count:s=>Math.ceil(s.length/4)};
const profile={id:'ds',protocol:'deepseek-messages',model:'deepseek-flash',baseURL:'https://api.deepseek.com/anthropic',accountId:'account-A',credential:{env:'TEST'},request:{reasoningEffort:'off',maxTokens:256},cache:{},pricing:{schemaVersion:1,model:'deepseek-flash',versions:[{id:'flat',effectiveFrom:'2026-11-12T00:00:00Z',currency:'CNY',rates:{input:2,cacheRead:.04,output:8}}]}};
function setup(overrides={}){
 const snapshot={sessionId:'s',turnId:1,revision:'r',contextWindow:20000,options:{sessionId:'s',model:profile.model,reasoningEffort:'off',maxTokens:256,system:'Original system',messages:[{role:'user',content:[{type:'text',text:'Please explain the cache without changing code.'}]},{role:'assistant',content:[{type:'text',text:'I can explain the prefix next.'}]}]}};
 return {profile,snapshot,originalPrompt:'P'.repeat(500),raw:'r'.repeat(8000),issues:['TOO_LONG'],tokens:2000,policy:{...POLICY_DEFAULTS,maxSuggestionTokens:100,repairMaxOutputTokens:256},language:{language:'en'},counter,scope:'scope-A',...overrides};
}
const usage=(n,h)=>normalizeUsage('deepseek-messages',{input_tokens:n-h,cache_read_input_tokens:h,output_tokens:64});
test('short parent and long rejected draft chooses fresh generation without resending draft',()=>{
 const selected=new RecoverySelector({now:()=>now}).plan(setup());
 assert.equal(selected.strategy,'parent-regenerate');assert.equal(selected.snapshot.options.system,'Original system');assert.equal(selected.snapshot.options.messages.length,2);
 assert(!selected.prompt.includes('r'.repeat(8000)));assert(selected.prompt.startsWith('P'.repeat(500)));
 assert.equal(selected.decision.estimateIsGuarantee,false);
});
test('cold long parent chooses minimal repair; recent verified hot prefix reverses choice',()=>{
 const s=new RecoverySelector({now:()=>now});const input=setup();
 input.snapshot.options.messages[0].content[0].text='z'.repeat(15500);
 assert.equal(s.plan({...input,primaryUsage:usage(4000,0),primaryAt:now}).strategy,'draft-only');
 const hot=s.plan({...input,primaryUsage:usage(4000,3968),primaryAt:now});
 assert.equal(hot.strategy,'parent-regenerate');
 const c=hot.decision.candidates.find(c=>c.strategy==='parent-regenerate');assert(c.expectedHitTokens>0);assert(c.expectedHitTokens<3968);
 assert(c.estimatedCost<c.coldCost);
});
test('unknown, expired and output-cap-changing primary observations get no cache credit',()=>{
 const s=new RecoverySelector({now:()=>now}),input=setup();
 for(const extra of [{primaryUsage:usage(4000,3968),primaryAt:now-400000},{primaryUsage:{status:'unknown'}},{primaryUsage:usage(4000,3968),primaryAt:now,policy:{...input.policy,repairMaxOutputTokens:128}}]){
  const d=s.plan({...input,...extra}).decision;
  assert.equal(d.candidates.find(c=>c.strategy==='parent-regenerate').expectedHitTokens,0);
 }
});
test('unpriced, native bridge and non-exact tokenizer keep minimal default',()=>{
 const s=new RecoverySelector({now:()=>now});
 for(const change of [{profile:{...profile,pricing:null}},{profile:{...profile,protocol:'codex-native'}},{counter:{...counter,exact:false}}]){
  const p=s.plan(setup(change));assert.equal(p.strategy,'draft-only');assert.equal(p.decision.reason,'unpriced-or-unsupported-fallback');
 }
});
test('explicit strategy, context constraints and switch margin are respected',()=>{
 const s=new RecoverySelector({now:()=>now}),input=setup();
 assert.equal(s.plan({...input,policy:{...input.policy,repairStrategy:'parent-with-draft'}}).strategy,'parent-with-draft');
 const zeroMargin=s.plan({...input,policy:{...input.policy,repairMinSavingsRatio:1}});assert.equal(zeroMargin.strategy,'draft-only');
 const blocked=setup({primaryUsage:usage(25000,24500)});assert.equal(s.plan(blocked).strategy,'draft-only');
});
test('oversized draft can be omitted and regenerated, never bypasses injection resource budget',()=>{
 const input=setup({raw:'r'.repeat(20000),tokens:5000});
 const p=new RecoverySelector({now:()=>now}).plan(input);
 assert.equal(p.strategy,'parent-regenerate');assert.equal(p.decision.candidates.length,1);
 assert(p.prompt.length<5000);
});
test('complex parent without known usage is unavailable; provider-reported input enables comparison',()=>{
 const input=setup();input.snapshot.options.messages[0].content.push({type:'image',attachment:{attachmentId:'x'}});
 const s=new RecoverySelector({now:()=>now}),a=s.plan(input);
 assert.equal(a.strategy,'draft-only');assert.equal(a.decision.candidates.find(c=>c.strategy==='parent-regenerate').available,false);
 assert.equal(s.plan({...input,primaryUsage:usage(600,0)}).strategy,'parent-regenerate');
});
test('receipts are bounded, expire, isolate credentials/account/route, and adjust exact repeat estimates',()=>{
 let time=now;const s=new RecoverySelector({now:()=>time}),input=setup();
 const a=s.plan(input);s.observe({...input,...a,usage:usage(700,640)});
 const b=s.plan(input);const estimate=b.decision.candidates.find(c=>c.strategy===a.strategy);
 assert.equal(estimate.inputTokens,700);assert(estimate.expectedHitTokens>0);
 const isolated=s.plan({...input,profile:{...profile,accountId:'other-account'}});assert.equal(isolated.decision.candidates.find(c=>c.strategy===a.strategy).expectedHitTokens,0);
 time+=400000;assert.equal(s.plan(input).decision.candidates.find(c=>c.strategy===a.strategy).expectedHitTokens,0);
 for(let i=0;i<300;i++)s.observe({...input,prompt:'different-'+i,usage:usage(100,0)});
 assert.equal(s.receipts.size,256);s.clear();assert.equal(s.receipts.size,0);
});
test('all cost estimates are nonnegative, bounded cache credit and unchanged rank under common half-price',()=>{
 const selector=new RecoverySelector({now:()=>now});
 for(const n of [100,1000,10000])for(const h of [0,.5,.99]){
  const input=setup({primaryUsage:usage(n,Math.floor(n*h)),primaryAt:now});
  const a=selector.plan(input),half=structuredClone(profile);half.pricing.versions[0].rates={input:1,cacheRead:.02,output:4};
  assert.equal(selector.plan({...input,profile:half}).strategy,a.strategy);
  for(const c of a.decision.candidates)if(c.estimatedCost!==null){assert(c.estimatedCost>=0&&c.estimatedCost<=c.coldCost);assert(c.expectedHitTokens<=c.inputTokens)}
 }
});
test('thinking output gets full cap; policy rejects invalid strategies/uncertainty discounts',()=>{
 const input=setup();input.snapshot.options.reasoningEffort='high';input.profile={...profile,request:{...profile.request,reasoningEffort:'high'}};
 const p=new RecoverySelector({now:()=>now}).plan(input);
 assert(p.decision.candidates.every(c=>c.outputTokens===256));
 for(const x of [{repairStrategy:'free'},{repairCacheDiscount:2},{repairCacheTtlMs:0}])assert.throws(()=>validatePolicy(x));
});
test('production engine uses selected strategy once, rechecks output, and records prediction and actual repair costs',async()=>{
 const ledger=new UsageLedger({path:':memory:'}),calls=[],input=setup();
 const engine=new PredictionEngine({now:()=>now,profiles:{current:()=>profile,publicCurrent:()=>profile,resolveCredential:async()=> 'fixture'},ledger,counterFor:async()=>counter,config:{enabled:true,maxSuggestionTokens:100,repairMaxOutputTokens:256},run:async(p,s,prompt,o)=>{
  calls.push({p,s,prompt,stage:o.stage});
  return {text:JSON.stringify({suggestion:calls.length===1?'word '.repeat(500):'Please explain the cache without changing code.'}),usage:usage(calls.length===1?350:430,0),finishReason:'stop'};
 }});
 engine.capture(input.snapshot);
 const result=await engine.sample({sessionId:'s',expectedTurnId:1});
 assert.equal(calls.length,2);assert.equal(result.status,'ready');assert.equal(result.recovery.selection.strategy,'parent-regenerate');
 assert.equal(calls[1].s.options.messages.length,2);assert(calls[1].prompt.startsWith(calls[0].prompt));
 const entry=ledger.list().find(r=>r.stage==='repair');assert.equal(entry.recoveryDecision.strategy,'parent-regenerate');assert(entry.cost.amount>0);
 await engine.dispose();
});

test('fresh exact DeepSeek requests share account evidence across threads, but Responses affinity stays isolated',()=>{
 const selector=new RecoverySelector({now:()=>now}),input=setup();
 const plan=selector.plan({...input,policy:{...input.policy,repairStrategy:'draft-only'}});
 selector.observe({...input,...plan,usage:usage(1334,1152)});
 const sibling=structuredClone(input.snapshot);sibling.sessionId='other';sibling.options.sessionId='other';
 const next=selector.plan({...input,snapshot:sibling});
 const c=next.decision.candidates.find(c=>c.strategy==='draft-only');
 assert.equal(c.inputTokens,1334);assert(c.expectedHitTokens>1000);
 const foreign=selector.plan({...input,scope:'other-account'});
 assert.equal(foreign.decision.candidates.find(c=>c.strategy==='draft-only').expectedHitTokens,0);
 const responses={...profile,protocol:'responses'};
 const a=selector.plan({...input,profile:responses,policy:{...input.policy,repairStrategy:'draft-only'}});
 selector.observe({...input,...a,profile:a.profile,usage:usage(1334,1152)});
 const b=selector.plan({...input,profile:responses,snapshot:sibling});
 assert.equal(b.decision.candidates.find(c=>c.strategy==='draft-only').expectedHitTokens,0);
});


test('the native parent route uses its frozen public price quote for repair selection instead of silently falling back to unpriced',()=>{
 let quoted=0;const selector=new RecoverySelector({quoteForParent:()=>{quoted++;return{status:'priced',currency:'CNY',versionId:'native-quote',rates:{input:1,cacheRead:0.02,output:4}}}});
 const snapshot={sessionId:'native',turnId:1,revision:'native',options:{provider:'deepseek-official',model:'deepseek-flash',maxTokens:4096,system:'stable',messages:[{role:'user',content:[{type:'text',text:'请继续检查。'}]}]},contextWindow:1048576};
 const counter={name:'native-exact-fixture',exact:true,count:s=>s.length};const result=selector.plan({profile:null,snapshot,originalPrompt:'predict',raw:'长'.repeat(7000),issues:['TOO_LONG'],tokens:7000,policy:{...POLICY_DEFAULTS,repairMaxOutputTokens:4096,maxRepairInputBytes:30000},language:{language:'zh'},counter,scope:'native',primaryUsage:{status:'known',inputTokens:512,cacheReadTokens:448,outputTokens:7000},primaryAt:Date.now()});
 assert.equal(quoted,1);assert.ok(result.decision.candidates.some(x=>x.strategy==='parent-regenerate'&&x.available));assert.equal(result.decision.currency,'CNY');assert.equal(result.decision.strategy,'parent-regenerate');
});
