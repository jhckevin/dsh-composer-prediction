import test from 'node:test';import assert from 'node:assert/strict';
import {ThreadAccounting,costShare,publicQuote} from '../src/core/thread-accounting.mjs';
import {UsageLedger,normalizeUsage,quotePrice} from '../src/core/billing.mjs';
const books=[{model:'deepseek-flash',pricing:{versions:[{id:'v',effectiveFrom:'2026-01-01T00:00:00Z',currency:'CNY',rates:{input:2,cacheRead:.04,output:8}}]}}];
const now=Date.parse('2026-11-12T03:00:00Z'),usage={inputTokens:100,cacheReadTokens:900,cacheWriteTokens:0,outputTokens:10};
test('share is prediction divided by main plus prediction, split by currency, zero and unknown are explicit',()=>{
 const p={currencies:{CNY:{amount:2},USD:{amount:1}},unpricedAttempts:0},m={currencies:{CNY:{amount:8},USD:{amount:3}},unpricedAttempts:0};
 const s=costShare(p,m);assert.equal(s.currencies.CNY.predictionShare,.2);assert.equal(s.currencies.USD.predictionShare,.25);
 assert.equal(costShare({...p,unpricedAttempts:1},m).currencies.CNY.predictionShare,null);
 assert.equal(costShare(p,m,{pending:1}).currencies.CNY.predictionShare,null);
 assert.equal(costShare({currencies:{CNY:{amount:0}}},{currencies:{}}).currencies.CNY.predictionShare,null);
 assert.equal(costShare({currencies:{CNY:{amount:1,upperBoundAmount:1}}},m).currencies.CNY.predictionShare,null);
});
test('live main streams use final snapshot only, ignore predictions, record failed usage, and isolate threads',async()=>{
 const a=new ThreadAccounting({path:':memory:',books,cutoff:now,now:()=>now});
 async function* stream(){yield {type:'usage',usage:{...usage,outputTokens:1}};yield {type:'usage',usage};yield {type:'finish',reason:{kind:'stop'}}}
 const options={sessionId:'a',provider:'deepseek-official',model:'deepseek-flash'};
 for await(const _ of a.track(options,stream())){}
 for await(const _ of a.track({...options,purpose:'composer-prediction'},stream())){}
 assert.equal(a.ledger.aggregate().attempts,1);assert.equal(a.ledger.aggregate().tokens.output,10);
 async function* failed(){yield {type:'usage',usage};throw Object.assign(Error('offline'),{code:'TRANSPORT'})}
 await assert.rejects(async()=>{for await(const _ of a.track({...options,sessionId:'b'},failed())){}});
 assert.equal(a.ledger.aggregate({sourceSessionId:'b'}).statusCounts.failed,1);
 assert.equal(a.ledger.aggregate({sourceSessionId:'a'}).attempts,1);await a.close();
});
test('historical import skips inherited and live settlements, uses latest stream usage and is idempotent',async()=>{
 const event=(seq,time,type,data)=>({seq,time,type,data});
 const events=[
 event(0,now-10000,'request/header',{header:{config:{provider:'deepseek-official',model:'deepseek-flash'}}}),
 event(1,now-9000,'assistant/message',{turn:1,step:1,usage}),
 event(2,now-8000,'step/start',{turn:2,step:1}),
 event(3,now-7000,'assistant/attempt',{turn:2,step:1,stream:[{type:'chunk',chunk:{type:'usage',usage:{...usage,outputTokens:1}}},{type:'chunk',chunk:{type:'usage',usage}}]}),
 event(4,now+1000,'assistant/message',{turn:3,step:1,usage})];
 const a=new ThreadAccounting({path:':memory:',books,cutoff:now,readSession:async()=>({events,inheritedEventCount:2})});
 await a.backfill('s');await a.backfill('s');assert.equal(a.ledger.aggregate().attempts,1);assert.equal(a.ledger.aggregate().tokens.output,10);
 assert.equal(publicQuote(books,{model:'gpt-custom',provider:'deepseek'},new Date(now).toISOString()),null);
 assert.equal(publicQuote(books,{model:'deepseek-flash',provider:'third-party'},new Date(now).toISOString()),null);
 await a.close();
});
test('sum includes all priced prediction retries and main attempts only in the bound thread',async()=>{
 const prediction=new UsageLedger({path:':memory:'}),a=new ThreadAccounting({path:':memory:',books,cutoff:now});
 const startedAt=new Date(now).toISOString(),quote=publicQuote(books,{provider:'deepseek',model:'deepseek-flash'},startedAt);
 for(const [id,session] of [['first','s'],['repair','s'],['other','t']])await prediction.record({id,profileId:'p',sourceSessionId:session,startedAt,status:'completed',quote,usage:normalizeUsage('deepseek-messages',{input_tokens:100,cache_read_input_tokens:900,output_tokens:10})});
 async function* stream(){yield {type:'usage',usage}}
 for await(const _ of a.track({sessionId:'s',provider:'deepseek',model:'deepseek-flash'},stream())){}
 const r=await a.summary(prediction,'s');assert.equal(r.prediction.attempts,2);assert(Math.abs(r.share.currencies.CNY.predictionShare-2/3)<1e-10);
 await a.close();prediction.close();
});

test('host plugin declares the web server used by the owner RPC connection',async()=>{const plugin=await import('../src/index.mjs');assert(plugin.inject.includes('webServer'))});
