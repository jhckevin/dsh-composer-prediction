import test from 'node:test';
import assert from 'node:assert/strict';
import { CostGate } from '../src/core/budget.mjs';
import { UsageLedger, quotePrice, normalizeUsage } from '../src/core/billing.mjs';
const startedAt='2026-11-12T01:00:00Z';
const book={versions:[{id:'v1',effectiveFrom:'2026-01-01T00:00:00Z',currency:'CNY',rates:{input:2,cacheRead:.04,output:8}}]};
const quote=quotePrice(book,startedAt);
const reserve=(id,patch={})=>({id,scopeKey:'session-a',quote,inputTokenUpperBound:1000,outputTokenUpperBound:100,...patch});
const entry=(id,patch={})=>({id,scopeKey:'session-a',profileId:'ds',protocol:'deepseek-messages',startedAt,status:'completed',quote,usage:normalizeUsage('deepseek-messages',{input_tokens:1000,cache_read_input_tokens:0,output_tokens:0}),...patch});
test('disabled default does not imply free usage; strict unknown price/currency/bounds refuse',()=>{
 const ledger=new UsageLedger({path:':memory:'});
 try{
  assert.equal(new CostGate({ledger}).reserve(reserve('disabled',{quote:null})).reason,'budget-disabled');
  const gate=new CostGate({ledger,limitByCurrency:{CNY:.01}});
  assert.equal(gate.reserve(reserve('q',{quote:null})).reason,'price-unknown');
  assert.equal(gate.reserve(reserve('currency',{quote:{...quote,currency:'USD'}})).reason,'currency-limit-missing');
  assert.equal(gate.reserve(reserve('bound',{inputTokenUpperBound:undefined})).reason,'token-upper-bound-missing');
  assert.equal(gate.reserve(reserve('write',{cacheWriteMayOccur:true})).reason,'cache-write-rate-unknown');
  assert.throws(()=>new CostGate({ledger,limitByCurrency:{CNY:-1}}),/invalid/);
 }finally{ledger.close();}
});
test('concurrent reservations use all-cold/output bounds and cannot oversubscribe',async()=>{
 const ledger=new UsageLedger({path:':memory:'});
 try{
  const gate=new CostGate({ledger,limitByCurrency:{CNY:.005}});
  const results=await Promise.all(['one','two','three'].map(id=>Promise.resolve(gate.reserve(reserve(id)))));
  assert.equal(results.filter(r=>r.allowed).length,1);
  assert.equal(results[0].reservation.amount,.0028);
  assert.equal(gate.reserve(reserve('one')).reason,'already-reserved');
  assert.throws(()=>gate.reserve(reserve('one',{outputTokenUpperBound:200})),/conflict/);
  assert.equal(gate.state({scopeKey:'session-a'}).totals.CNY.reserved,.0028);
  assert.equal(gate.release('one').reason,'settlement-unconfirmed');
  assert.equal(gate.release('one',{settled:true}).reason,'awaiting-ledger-settlement');
  assert.equal(gate.release('one',{notDispatched:true}).released,true);
  assert.equal(gate.reserve(reserve('two')).allowed,true);
 }finally{ledger.close();}
});
test('durable settlement replaces reservations with actual cost and supports pending ownership',async()=>{
 const ledger=new UsageLedger({path:':memory:'});
 try{
  const gate=new CostGate({ledger,limitByCurrency:{CNY:.005}});
  gate.reserve(reserve('one'));await ledger.begin(entry('one'));
  assert.equal(gate.state({scopeKey:'session-a'}).totals.CNY.uncoveredPending,0);
  assert.equal(gate.release('one',{notDispatched:true}).reason,'attempt-already-recorded');
  await ledger.record(entry('one'));
  assert.equal(gate.release('one',{settled:true}).released,true);
  assert.equal(gate.state({scopeKey:'session-a'}).totals.CNY.spent,.002);
  assert.equal(gate.reserve(reserve('one')).reason,'attempt-already-settled');
  assert.equal(gate.reserve(reserve('two')).allowed,true);
  assert.equal(gate.reserve(reserve('three')).reason,'budget-exceeded');
 }finally{ledger.close();}
});
test('unreserved pending and failed unknown billing block strict budgets, per scope',async()=>{
 const ledger=new UsageLedger({path:':memory:'});
 try{
  const gate=new CostGate({ledger,limitByCurrency:{CNY:.1}});
  await ledger.begin(entry('orphan'));
  assert.equal(gate.reserve(reserve('new')).reason,'unreserved-pending-attempt');
  assert.equal(gate.reserve(reserve('other',{scopeKey:'session-b'})).allowed,true);
  await ledger.recoverPending({finishedAt:'2026-11-12T01:01:00Z'});
  assert.equal(gate.reserve(reserve('new')).reason,'unreconciled-usage');
  const different=new CostGate({ledger,limitByCurrency:{CNY:.1},scope:'global'});
  assert.equal(different.reserve(reserve('global',{scopeKey:'session-c'})).reason,'unreconciled-usage');
 }finally{ledger.close();}
});
test('cache write premium and currency-separated totals are conservative',async()=>{
 const ledger=new UsageLedger({path:':memory:'});
 try{
  const gate=new CostGate({ledger,limitByCurrency:{CNY:.005,USD:.01}});
  const premium={...quote,rates:{...quote.rates,cacheWrite:3}};
  const r=gate.reserve(reserve('premium',{quote:premium,cacheWriteMayOccur:true}));
  assert.equal(r.reservation.amount,.0038);
  const usdQuote={...quote,currency:'USD'};
  assert.equal(gate.reserve(reserve('usd',{quote:usdQuote})).allowed,true);
  await ledger.record(entry('existing',{scopeKey:'different'}));
  assert.equal(gate.state({scopeKey:'session-a'}).totals.CNY.spent,0);
  assert.equal(gate.state({scopeKey:'session-a'}).totals.USD.reserved,.0028);
  const unknown=entry('premium',{quote:premium,status:'failed',usage:normalizeUsage('deepseek-messages',null)});
  await ledger.record(unknown);
  assert.equal(gate.release('premium',{settled:true}).reason,'unpriced-ledger-outcome');
  assert.equal(gate.reserve(reserve('next')).reason,'unreconciled-usage');
 }finally{ledger.close();}
});
test('zero limits, exact boundary and reconfiguration retain existing reservations',()=>{
 const ledger=new UsageLedger({path:':memory:'});
 try{
  const gate=new CostGate({ledger,limitByCurrency:{CNY:0}});
  assert.equal(gate.reserve(reserve('zero')).allowed,false);
  gate.configure({limitByCurrency:{CNY:.0028}});
  assert.equal(gate.reserve(reserve('one')).allowed,true);
  assert.equal(gate.reserve(reserve('extra')).allowed,false);
  gate.configure({limitByCurrency:null});
  assert.equal(gate.state().activeReservations,1);
  assert.equal(gate.release('one',{notDispatched:true}).released,true);
 }finally{ledger.close();}
});
