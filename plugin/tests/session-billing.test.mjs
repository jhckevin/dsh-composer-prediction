
import test from 'node:test';import assert from 'node:assert/strict';
import {UsageLedger,normalizeUsage,quotePrice} from '../src/core/billing.mjs';
import {PredictionEngine} from '../src/core/engine.mjs';import {CostGate} from '../src/core/budget.mjs';
test('session billing filters never mix equal turn numbers from different chats',async()=>{
 const ledger=new UsageLedger({path:':memory:'}),startedAt='2026-11-12T01:00:00Z';
 const quote=quotePrice({versions:[{id:'test',effectiveFrom:'2026-01-01T00:00:00Z',currency:'CNY',rates:{input:2,cacheRead:0.04,output:8}}]},startedAt);
 for(const session of ['a','b'])await ledger.record({id:session,profileId:'p',scopeKey:'scope',sourceSessionId:session,sourceTurnId:'1',startedAt,status:'completed',quote,usage:normalizeUsage('responses',{input_tokens:1000,input_tokens_details:{cached_tokens:900},output_tokens:12})});
 assert.equal(ledger.aggregate({sourceSessionId:'a'}).attempts,1);assert.equal(ledger.aggregate({sourceSessionId:'b'}).tokens.input,1000);assert.equal(ledger.aggregate({sourceSessionId:'absent'}).attempts,0);assert.equal(ledger.aggregate().attempts,2);ledger.close()
});
test('strict unknown-price budget refuses before any physical dispatch or pending receipt',async()=>{
 const ledger=new UsageLedger({path:':memory:'});let calls=0;
 const engine=new PredictionEngine({profiles:{current:()=>null,publicCurrent:()=>null},ledger,costGate:new CostGate({ledger,limitByCurrency:{CNY:1},scope:'global'}),parentRun:async()=>{calls++;return {text:'{"suggestion":"继续"}'}},config:{enabled:true}});
 engine.capture({sessionId:'s',turnId:1,options:{model:'m',messages:[],maxTokens:100},contextWindow:1000});
 assert.equal((await engine.sample({sessionId:'s',expectedTurnId:1})).reason,'price-unknown');assert.equal(calls,0);assert.equal(ledger.pending().length,0);assert.equal(ledger.aggregate().attempts,0);await engine.dispose();
});
