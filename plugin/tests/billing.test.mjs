import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizeUsage, schedulePeriod, quotePrice, priceUsage, UsageLedger } from '../src/core/billing.mjs';
const calendar={coverageYears:[2026],dates:['2026-10-01','2026-10-02','2026-10-05','2026-10-06','2026-10-07'],sourceUrl:'https://www.gov.cn/'};
const book={source:'official',checkedAt:'2026-11-12T00:00:00Z',versions:[{id:'v1',effectiveFrom:'2026-01-01T00:00:00Z',currency:'CNY',rates:{input:2,cacheRead:.04,output:8},schedule:{type:'deepseek-cn-peak',calendar}}]};
test('Messages cold+cached+created and Responses total semantics do not double count',()=>{
 const d=normalizeUsage('deepseek-messages',{input_tokens:100,cache_read_input_tokens:900,cache_creation_input_tokens:0,output_tokens:50});
 const r=normalizeUsage('responses',{input_tokens:1000,input_tokens_details:{cached_tokens:900},output_tokens:50,output_tokens_details:{reasoning_tokens:20}});
 assert.equal(d.inputTokens,1000); assert.equal(d.uncachedInputTokens,100);assert.equal(r.uncachedInputTokens,100);
 assert.equal(r.outputTokens,50);assert.equal(r.reasoningTokens,20);
 const w=normalizeUsage('responses',{input_tokens:1000,input_tokens_details:{cached_tokens:700,cache_write_tokens:100},output_tokens:20});
 assert.equal(w.uncachedInputTokens,200);assert.equal(w.inputTokens,1000);
 assert.equal(normalizeUsage('responses',null).status,'unknown');
 assert.equal(normalizeUsage('responses',{input_tokens:1000,output_tokens:20}).status,'partial');
 assert.equal(normalizeUsage('responses',{input_tokens:10,input_tokens_details:{cached_tokens:20},output_tokens:2}).status,'unknown');
 assert.equal(normalizeUsage('responses',{input_tokens:10,input_tokens_details:{cached_tokens:0},output_tokens:2,output_tokens_details:{reasoning_tokens:3}}).status,'unknown');
});
test('Shanghai peak boundaries, lunch, weekends, holidays and UTC midnight transitions',()=>{
 const schedule=book.versions[0].schedule;
 for(const [date,period] of [
 ['2026-11-12T00:59:59Z','off-peak'],['2026-11-12T01:00:00Z','peak'],['2026-11-12T03:59:59Z','peak'],['2026-11-12T04:00:00Z','off-peak'],['2026-11-12T05:59:59Z','off-peak'],['2026-11-12T06:00:00Z','peak'],['2026-11-12T10:00:00Z','off-peak'],['2026-11-14T01:00:00Z','off-peak'],['2026-10-01T01:00:00Z','off-peak'],['2026-11-13T16:00:00Z','off-peak']]) assert.equal(schedulePeriod(schedule,date).period,period,date);
 assert.equal(schedulePeriod(schedule,'2027-11-12T01:00:00Z').certainty,'upper-bound-calendar-unknown');
 assert.equal(schedulePeriod(schedule,'2027-11-12T12:00:00Z').certainty,'exact');
 assert.equal(schedulePeriod(schedule,'2026-11-12T01:00:00Z').localDate,'2026-11-12');
 assert.throws(()=>schedulePeriod(schedule,'2026-11-12 10:00'),/offset/);
});
test('custom weekly overnight windows use the prior weekday',()=>{
 const schedule={type:'weekly',timeZone:'UTC',weekdays:[5],windows:[['22:00','02:00']],offPeakMultiplier:.25};
 assert.equal(schedulePeriod(schedule,'2026-11-13T23:00:00Z').period,'peak');
 assert.equal(schedulePeriod(schedule,'2026-11-14T01:00:00Z').period,'peak');
 assert.equal(schedulePeriod(schedule,'2026-11-14T02:00:00Z').period,'off-peak');
 assert.equal(schedulePeriod(schedule,'2026-11-15T01:00:00Z').period,'off-peak');
});
test('request-time price versions immutable; missing rate/calendar has explicit uncertainty',()=>{
 const usage=normalizeUsage('deepseek-messages',{input_tokens:2000,cache_read_input_tokens:98000,output_tokens:0});
 const q=quotePrice(book,'2026-11-12T01:00:00Z'),cost=priceUsage(usage,q);
 assert.equal(cost.amount,.00792);assert.equal(q.rates.input,2);assert.equal(quotePrice(book,'2026-11-12T04:00:00Z').rates.input,1);
 const revised=structuredClone(book);revised.versions.push({...book.versions[0],id:'v2',effectiveFrom:'2026-11-12T02:00:00Z',rates:{input:4,cacheRead:.08,output:16}});
 assert.equal(quotePrice(revised,'2026-11-12T02:00:00Z').versionId,'v2');assert.equal(q.rates.input,2);
 assert.equal(quotePrice(revised,'2025-12-31T00:00:00Z').status,'unpriced');
 assert.equal(quotePrice({},'2026-11-12T01:00:00Z').status,'unpriced');
 const write=normalizeUsage('responses',{input_tokens:100,input_tokens_details:{cached_tokens:10,cache_write_tokens:20},output_tokens:2});
 assert.equal(priceUsage(write,q).reason,'rate-missing-cacheWrite');
 assert.equal(priceUsage(usage,quotePrice(book,'2027-11-12T01:00:00Z')).status,'upper-bound');
 assert.ok(Object.isFrozen(q.rates));
});
test('durable immutable idempotency, failed/cancelled unknown records and currency separation',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'prediction-ledger-')),path=join(dir,'usage.sqlite');
 const usage=normalizeUsage('deepseek-messages',{input_tokens:2000,cache_read_input_tokens:98000,output_tokens:0});
 const entry={id:'a',profileId:'ds',protocol:'deepseek-messages',startedAt:'2026-11-12T01:00:00Z',finishedAt:'2026-11-12T01:00:01Z',status:'completed',usage,quote:quotePrice(book,'2026-11-12T01:00:00Z')};
 let ledger=new UsageLedger({path});
 try {
  assert.equal((await ledger.record(entry)).inserted,true);assert.equal((await ledger.record(entry)).inserted,false);
  await assert.rejects(ledger.record({...entry,status:'cancelled'}),/conflict/);
  await ledger.record({...entry,id:'failed',status:'failed',usage:normalizeUsage('deepseek-messages',null)});
  const usd={versions:[{id:'custom',effectiveFrom:'2026-01-01T00:00:00Z',currency:'USD',rates:{input:2,cacheRead:.2,output:10}}]};
  await ledger.record({...entry,id:'usd',profileId:'custom',quote:quotePrice(usd,entry.startedAt)});
  await ledger.record({...entry,id:'cancelled',status:'cancelled',quote:undefined,usage:normalizeUsage('deepseek-messages',null)});
  ledger.close();ledger=new UsageLedger({path});
  assert.equal((await ledger.record(entry)).inserted,false);
  const totals=ledger.aggregate();assert.equal(totals.attempts,4);assert.equal(totals.usageUnknown,2);
  assert.equal(totals.currencies.CNY.amount,.00792);assert.equal(totals.currencies.USD.amount,.0236);
  assert.equal(totals.cacheHitRatio,.98);assert.equal(totals.unpricedAttempts,2);
  assert.equal(ledger.aggregate({profileId:'ds'}).attempts,3);
  assert.equal(ledger.list({status:'failed'})[0].cost.amount,null);
  assert.ok(!JSON.stringify(ledger.list()).includes('authorization'));
  const second=new UsageLedger({path});try {assert.equal((await second.record(entry)).inserted,false);}finally{second.close();}
 }finally{ledger.close();await rm(dir,{recursive:true,force:true});}
});

test('dispatch snapshots survive interruption, settle atomically and recover with unknown billing',async()=>{
 const ledger=new UsageLedger({path:':memory:'});
 const startedAt='2026-11-12T01:00:00Z', quote=quotePrice(book,startedAt);
 const dispatch={id:'pending-1',profileId:'ds',protocol:'deepseek-messages',startedAt,quote};
 try {
  assert.equal((await ledger.begin(dispatch)).inserted,true);
  assert.equal((await ledger.begin(dispatch)).inserted,false);
  assert.equal(ledger.pending().length,1);assert.equal(ledger.aggregate().pendingAttempts,1);
  await assert.rejects(ledger.begin({...dispatch,profileId:'other'}),/conflict/);
  await assert.rejects(ledger.record({...dispatch,profileId:'other',status:'failed'}),/snapshot/);
  const recovered=await ledger.recoverPending({finishedAt:'2026-11-12T01:01:00Z'});
  assert.equal(recovered.length,1);assert.equal(recovered[0].status,'abandoned');
  assert.equal(recovered[0].cost.amount,null);assert.equal(ledger.pending().length,0);
  await assert.rejects(ledger.begin(dispatch),/settled/);
  const next={...dispatch,id:'pending-2'};
  await ledger.begin(next);
  const usage=normalizeUsage('responses',{input_tokens:100,input_tokens_details:{cached_tokens:90},output_tokens:2});
  await ledger.record({...next,status:'completed',usage,finishedAt:'2026-11-12T01:00:02Z'});
  assert.equal(ledger.pending().length,0);assert.equal(ledger.aggregate().attempts,2);
  assert.equal(usage.reasoningTokens,null);
  await assert.rejects(ledger.record({...next,id:'bad-time',status:'completed',startedAt:'2026-11-12T01:00:01Z',usage}),/timestamp/);
 }finally{ledger.close();}
});
