import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { canonicalJSON } from './profiles.mjs';

const MILLION = 1_000_000;
function freeze(x) { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); } return x; }
function token(x) { return Number.isSafeInteger(x) && x >= 0 ? x : null; }
function at(value) {
  if (typeof value !== 'string' || !/(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('timestamp must include an explicit UTC offset');
  return new Date(value).toISOString();
}
function pick(...values) { return values.find(x => x !== undefined); }
/** Normalize a final usage snapshot. Never add streaming message_start/message_delta snapshots. */
export function normalizeUsage(protocol, raw) {
  if (!raw || typeof raw !== 'object') return freeze({ status: 'unknown', reason: 'usage-missing', inputTokens: null, uncachedInputTokens: null, cacheReadTokens: null, cacheWriteTokens: null, outputTokens: null, reasoningTokens: null });
  let total, cold, read, write, output, reasoning;
  if (['deepseek-messages','anthropic-messages'].includes(protocol)) {
    cold = token(raw.input_tokens); read = token(raw.cache_read_input_tokens);
    write = token(raw.cache_creation_input_tokens ?? 0);
    total = [cold, read, write].every(x => x !== null) ? cold + read + write : null;
    output = token(raw.output_tokens); reasoning = token(raw.reasoning_tokens ?? raw.output_tokens_details?.reasoning_tokens ?? raw.output_tokens_details?.thinking_tokens);
  } else if (['chat-completions','totals-only'].includes(protocol)) {
    total=token(raw.prompt_tokens??raw.input_tokens);
    read=protocol==='totals-only'?null:token(raw.prompt_tokens_details?.cached_tokens??raw.prompt_cache_hit_tokens);
    write=protocol==='totals-only'?null:token(raw.prompt_tokens_details?.cache_write_tokens??0);
    cold=[total,read,write].every(x=>x!==null)&&read+write<=total?total-read-write:null;
    if(raw.prompt_cache_miss_tokens!==undefined && cold!==null && token(raw.prompt_cache_miss_tokens)!==cold)return freeze({status:'unknown',reason:'usage-inconsistent',inputTokens:null,uncachedInputTokens:null,cacheReadTokens:null,cacheWriteTokens:null,outputTokens:null,reasoningTokens:null});
    output=token(raw.completion_tokens??raw.output_tokens);reasoning=token(raw.completion_tokens_details?.reasoning_tokens??raw.output_tokens_details?.reasoning_tokens ?? raw.output_tokens_details?.thinking_tokens);
  } else if (protocol === 'responses') {
    total = token(raw.input_tokens);
    read = token(raw.input_tokens_details?.cached_tokens);
    write = token(raw.input_tokens_details?.cache_write_tokens ?? 0);
    cold = [total, read, write].every(x => x !== null) && read + write <= total ? total - read - write : null;
    output = token(raw.output_tokens); reasoning = token(raw.output_tokens_details?.reasoning_tokens ?? raw.output_tokens_details?.thinking_tokens);
  } else if (protocol === 'codex-native') {
    total = token(pick(raw.inputTokens, raw.input_tokens));
    read = token(pick(raw.cachedInputTokens, raw.cached_input_tokens, raw.input_tokens_details?.cached_tokens));
    write = token(pick(raw.cacheWriteTokens, raw.input_tokens_details?.cache_write_tokens, 0));
    cold = [total, read, write].every(x => x !== null) && read + write <= total ? total - read - write : null;
    output = token(pick(raw.outputTokens, raw.output_tokens));
    reasoning = token(pick(raw.reasoningOutputTokens, raw.reasoning_tokens, raw.output_tokens_details?.reasoning_tokens ?? raw.output_tokens_details?.thinking_tokens));
  } else throw new Error('unsupported usage protocol');
  const numbers = [total, cold, read, write, output, reasoning];
  const rawCounters=[raw.input_tokens,raw.output_tokens,raw.prompt_tokens,raw.completion_tokens,raw.cache_read_input_tokens,raw.cache_creation_input_tokens,raw.prompt_cache_hit_tokens,raw.prompt_cache_miss_tokens,raw.input_tokens_details?.cached_tokens,raw.input_tokens_details?.cache_write_tokens,raw.prompt_tokens_details?.cached_tokens,raw.prompt_tokens_details?.cache_write_tokens];
  const invalid = rawCounters.some(x=>x!==undefined&&token(x)===null)||numbers.some(x => x !== null && !Number.isSafeInteger(x)) ||
    (total !== null && read !== null && write !== null && read + write > total) ||
    (output !== null && reasoning !== null && reasoning > output);
  const status = invalid ? 'unknown' : numbers.slice(0, 5).every(x => x !== null) ? 'known' : 'partial';
  return freeze({ status, ...(status !== 'known' ? { reason: invalid ? 'usage-inconsistent' : 'usage-incomplete' } : {}), inputTokens: total, uncachedInputTokens: cold, cacheReadTokens: read, cacheWriteTokens: write, outputTokens: output, reasoningTokens: reasoning });
}
function parts(instant, timeZone) {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(instant)).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  return { date: values.year + '-' + values.month + '-' + values.day, year: Number(values.year),
    weekday: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(values.weekday), minute: Number(values.hour) * 60 + Number(values.minute) };
}
function minute(hhmm) { const [h,m] = hhmm.split(':').map(Number); return h * 60 + m; }
/** End-exclusive windows, including schedules that cross midnight. */
export function schedulePeriod(schedule = { type: 'flat' }, instant) {
  at(instant);
  if (schedule.type === 'flat') return freeze({ period: 'flat', multiplier: 1, certainty: 'exact' });
  if (!['deepseek-cn-peak', 'weekly'].includes(schedule.type)) throw new Error('unsupported price schedule');
  const native = schedule.type === 'deepseek-cn-peak';
  const timeZone = native ? 'Asia/Shanghai' : schedule.timeZone;
  const local = parts(instant, timeZone);
  const weekdays = native ? [1,2,3,4,5] : schedule.weekdays;
  const windows = native ? [['09:00','12:00'],['14:00','18:00']] : schedule.windows;
  const off = schedule.offPeakMultiplier ?? 0.5;
  let candidateDate = local.date; let candidateYear = local.year;
  const inWindow = windows.some(w => {
    const start = minute(w[0]), end = minute(w[1]);
    if (start === end) return weekdays.includes(local.weekday); // explicitly configured all day
    if (start < end) return weekdays.includes(local.weekday) && local.minute >= start && local.minute < end;
    if (local.minute >= start) return weekdays.includes(local.weekday);
    if (local.minute < end && weekdays.includes((local.weekday + 6) % 7)) {
      const previous = new Date(Date.parse(local.date + 'T00:00:00Z') - 86400000).toISOString().slice(0, 10);
      candidateDate = previous; candidateYear = Number(previous.slice(0, 4)); return true;
    }
    return false;
  });
  if (!inWindow) return freeze({ period: 'off-peak', multiplier: off, certainty: 'exact', localDate: local.date, timeZone });
  const calendar = schedule.calendar;
  // The official DeepSeek calendar is required for weekday peak candidates. Unknown coverage
  // uses the larger peak price, with an explicit upper-bound marker rather than a fabricated holiday flag.
  const needsCalendar = native || calendar !== undefined;
  const known = calendar?.coverageYears?.includes(candidateYear) ?? false;
  const holiday = known && calendar.dates.includes(candidateDate);
  return freeze({ period: holiday ? 'off-peak' : 'peak', multiplier: holiday ? off : 1,
    certainty: needsCalendar && !known ? 'upper-bound-calendar-unknown' : 'exact',
    ...(needsCalendar ? { calendarCoverageKnown: known, ...(known ? { holiday } : {}), calendarSource: calendar?.sourceUrl ?? null } : {}),
    localDate: local.date, timeZone });
}
export function quotePrice(profileOrBook, startedAt) {
  const instant = at(startedAt), book = profileOrBook?.pricing ?? profileOrBook;
  if (!book?.versions?.length) return freeze({ status: 'unpriced', reason: 'pricebook-missing', requestStartedAt: instant });
  const versions = book.versions.filter(v => Date.parse(v.effectiveFrom) <= Date.parse(instant) && (!v.effectiveUntil || Date.parse(instant) < Date.parse(v.effectiveUntil))).sort((a,b) => Date.parse(b.effectiveFrom) - Date.parse(a.effectiveFrom));
  if (!versions.length) return freeze({ status: 'unpriced', reason: 'no-effective-price-version', requestStartedAt: instant });
  const v = versions[0], period = schedulePeriod(v.schedule, instant), rates = {};
  for (const [key, value] of Object.entries(v.rates)) {
    if (!Number.isFinite(value) || value < 0) throw new Error('invalid price rate');
    rates[key] = value * period.multiplier;
  }
  return freeze({ status: 'priced', requestStartedAt: instant, versionId: v.id,
    effectiveFrom: at(v.effectiveFrom), ...(v.effectiveUntil ? { effectiveUntil: at(v.effectiveUntil) } : {}),
    currency: v.currency, rates, ...period, source: book.source ?? null, checkedAt: book.checkedAt ?? null });
}
export function priceUsage(usage, quote) {
  if(usage?.status==='partial'&&usage.reason==='usage-incomplete'&&token(usage.inputTokens)!==null&&token(usage.outputTokens)!==null&&quote?.status==='priced'){
    const rates=['input','cacheRead','cacheWrite'].map(k=>quote.rates?.[k]).filter(Number.isFinite);
    if(rates.length>=2&&Number.isFinite(quote.rates?.output)){
      const output=usage.outputTokens*quote.rates.output/MILLION,amount=usage.inputTokens*Math.max(...rates)/MILLION+output;
      return freeze({status:'upper-bound',reason:'cache-breakdown-unavailable',currency:quote.currency,amount,lowerBoundAmount:usage.inputTokens*Math.min(...rates)/MILLION+output,components:{inputUpperBound:amount-output,output},cacheReadSavings:null,...quote.versionId!==undefined?{versionId:quote.versionId}:{}});
    }
  }
  if (usage?.status !== 'known') return freeze({ status: 'unpriced', reason: usage?.reason ?? 'usage-missing', currency: quote?.currency ?? null, amount: null });
  if (quote?.status !== 'priced') return freeze({ status: 'unpriced', reason: quote?.reason ?? 'quote-missing', currency: quote?.currency ?? null, amount: null });
  const components = {};
  for (const [kind, count] of [['input', usage.uncachedInputTokens], ['cacheRead', usage.cacheReadTokens], ['cacheWrite', usage.cacheWriteTokens], ['output', usage.outputTokens]]) {
    if (!Number.isSafeInteger(count) || count < 0) return freeze({ status: 'unpriced', reason: 'usage-invalid', currency: quote.currency, amount: null });
    if (count > 0 && !Number.isFinite(quote.rates?.[kind])) return freeze({ status: 'unpriced', reason: 'rate-missing-' + kind, currency: quote.currency, amount: null });
    components[kind] = count === 0 ? 0 : count * quote.rates[kind] / MILLION;
  }
  if (Object.values(components).some(x => !Number.isFinite(x) || x < 0)) throw new Error('invalid price calculation');
  const amount = Object.values(components).reduce((a,b) => a+b, 0);
  return freeze({ status: quote.certainty === 'exact' ? 'priced' : 'upper-bound', currency: quote.currency,
    amount, components, cacheReadSavings: usage.cacheReadTokens * (quote.rates.input - quote.rates.cacheRead) / MILLION, ...(quote.versionId!==undefined?{versionId:quote.versionId}:{}) });
}
const EFFECTIVE='(SELECT a.id,a.profile_id,a.scope_key,a.started_at,COALESCE(json_extract(r.payload,\'$.status\'),a.status) AS status,COALESCE(r.payload,a.payload) AS payload FROM attempts a LEFT JOIN reconciliations r ON r.id=a.id)';
const TERMINAL = new Set(['completed', 'failed', 'cancelled', 'abandoned']);
function safeEntry(entry) {
  if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || entry.id.length > 256) throw new Error('ledger id is required');
  if (typeof entry.profileId !== 'string' || !entry.profileId) throw new Error('ledger profileId is required');
  if (!TERMINAL.has(entry.status)) throw new Error('ledger status must be terminal');
  const result = {};
  for (const key of ['id','profileId','scopeKey','protocol','model','startedAt','finishedAt','status','groupId','stage','attemptNumber','sourceSessionId','sourceTurnId','trigger','errorCode','billingSource','billingDisposition','reasoningPolicy']) {
    if (entry[key] !== undefined) { if (typeof entry[key] !== 'string' || entry[key].length > 4096) throw new Error('invalid ledger ' + key); result[key] = entry[key]; }
  }
  result.startedAt = at(entry.startedAt); result.finishedAt = at(entry.finishedAt ?? entry.startedAt);
  if (result.finishedAt < result.startedAt) throw new Error('finishedAt precedes startedAt');
  // Persist only allowlisted scalar usage and quote fields; never request bodies, headers, or credential values.
  const u = entry.usage ?? normalizeUsage(entry.protocol, undefined);
  result.usage = Object.fromEntries(['status','reason','inputTokens','uncachedInputTokens','cacheReadTokens','cacheWriteTokens','outputTokens','reasoningTokens'].filter(k => u[k] !== undefined).map(k => [k,u[k]]));
  if (!['known','partial','unknown'].includes(result.usage.status)) throw new Error('invalid normalized usage status');
  for (const k of ['inputTokens','uncachedInputTokens','cacheReadTokens','cacheWriteTokens','outputTokens','reasoningTokens']) {
    if (result.usage[k] !== null && result.usage[k] !== undefined && token(result.usage[k]) === null) throw new Error('invalid normalized token count');
  }
  if (result.usage.status === 'known' && (
    ['inputTokens','uncachedInputTokens','cacheReadTokens','cacheWriteTokens','outputTokens'].some(k => token(result.usage[k]) === null) ||
    result.usage.inputTokens !== result.usage.uncachedInputTokens + result.usage.cacheReadTokens + result.usage.cacheWriteTokens ||
    (result.usage.reasoningTokens !== null && result.usage.reasoningTokens > result.usage.outputTokens))) throw new Error('inconsistent normalized usage');
  if(entry.recoveryDecision!==undefined){
    const d=entry.recoveryDecision;
    if(!d||typeof d!=='object'||!['draft-only','parent-regenerate','parent-with-draft'].includes(d.strategy)||Buffer.byteLength(JSON.stringify(d))>8192)throw Error('invalid recovery decision');
    const fields=['version','strategy','reason','estimatedAt','currency','priceVersion','pricePeriod','estimateIsGuarantee','cacheDiscount'];
    result.recoveryDecision=Object.fromEntries(fields.filter(k=>d[k]!==undefined).map(k=>[k,d[k]]));
    result.recoveryDecision.candidates=(d.candidates??[]).slice(0,3).map(c=>Object.fromEntries(['strategy','available','inputTokens','expectedHitTokens','outputTokens','outputBudget','estimatedCost','coldCost','evidence'].filter(k=>c[k]!==undefined).map(k=>[k,c[k]])));
  }
  const q = entry.quote ?? { status: 'unpriced', reason: 'quote-missing', requestStartedAt: result.startedAt };
  result.quote = Object.fromEntries(['status','reason','requestStartedAt','versionId','effectiveFrom','effectiveUntil','currency','rates','period','multiplier','certainty','localDate','timeZone','calendarCoverageKnown','holiday','calendarSource','source','checkedAt','pricingBasis'].filter(k => q[k] !== undefined).map(k => [k, q[k]]));
  if (q.rates) result.quote.rates = Object.fromEntries(['input','cacheRead','cacheWrite','output'].filter(k => q.rates[k] !== undefined).map(k => [k,q.rates[k]]));
  if (result.quote.status === 'priced' && at(result.quote.requestStartedAt) !== result.startedAt) throw new Error('quote request timestamp does not match attempt');
  result.cost = priceUsage(result.usage, result.quote);
  if(entry.billingDisposition==='not-dispatched'){if(entry.noDispatchEvidence?.noProviderInvocation!==true||['inputTokens','outputTokens','cacheReadTokens'].some(k=>(result.usage[k]??0)>0))throw Error('non-dispatch evidence required');result.noDispatchEvidence={noProviderInvocation:true};result.cost=freeze({status:'not-billed',currency:result.quote.currency??null,amount:0,reason:'not-dispatched'});}
  if(entry.billingDisposition==='provider-rejected-http'){
    const e=entry.rejectionEvidence;
    if(entry.status!=='failed'||!Number.isInteger(e?.httpStatus)||e.httpStatus<400||e.httpStatus>=500||e.httpStatus===408||e?.streamHadGeneration!==false||e?.preGenerationRejection!==true||['inputTokens','outputTokens','cacheReadTokens'].some(k=>(result.usage[k]??0)>0))throw Error('pre-generation rejection evidence required');
    result.rejectionEvidence={httpStatus:e.httpStatus,code:String(e.code),streamHadGeneration:false,preGenerationRejection:true};
    result.cost=freeze({status:'not-billed',currency:result.quote.currency??null,amount:0,reason:'provider-rejected-http'});
  }
  if(entry.billingDisposition==='provider-rejected-402'){
    if(entry.status!=='failed'||['inputTokens','uncachedInputTokens','cacheReadTokens','cacheWriteTokens','outputTokens'].some(k=>(result.usage[k]??0)>0))throw Error('rejection cannot replace billable usage');
    const e=entry.rejectionEvidence;if(e?.httpStatus!==402||e?.code!=='QUOTA'||e?.streamHadGeneration!==false)throw Error('rejection evidence required');
    result.rejectionEvidence={httpStatus:402,code:'QUOTA',streamHadGeneration:false};
    result.cost=freeze({status:'not-billed',currency:result.quote.currency??null,amount:0,reason:'provider-rejected-402'});
  }
  return freeze(result);
}
function where(filters = {}) {
  const clauses = [], args = [];
  for (const [field, column] of [['profileId','profile_id'],['scopeKey','scope_key'],['status','status']]) if (filters[field] !== undefined) { clauses.push(column + ' = ?'); args.push(filters[field]); }
  if (filters.sourceSessionId !== undefined) { clauses.push("json_extract(payload, '$.sourceSessionId') = ?"); args.push(filters.sourceSessionId); }
  if (filters.since) { clauses.push('started_at >= ?'); args.push(at(filters.since)); }
  if (filters.until) { clauses.push('started_at < ?'); args.push(at(filters.until)); }
  return { sql: clauses.length ? ' WHERE ' + clauses.join(' AND ') : '', args };
}
/** Durable immutable attempt ledger. Call once in finally for every completed/failed/cancelled
 * physical request; retries have separate ids. The id is an idempotency key, never reused for a new attempt. */
export class UsageLedger {
  #db;
  constructor({ path }) {
    if (typeof path !== 'string' || !path) throw new Error('ledger path is required');
    const actual = path === ':memory:' ? path : resolve(path);
    if (actual !== ':memory:') mkdirSync(dirname(actual), { recursive: true, mode: 0o700 });
    this.#db = new DatabaseSync(actual);
    this.#db.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, scope_key TEXT, started_at TEXT NOT NULL, status TEXT NOT NULL, payload TEXT NOT NULL); CREATE INDEX IF NOT EXISTS attempts_profile_time ON attempts(profile_id, started_at); CREATE TABLE IF NOT EXISTS reconciliations (id TEXT PRIMARY KEY, original_payload TEXT NOT NULL, payload TEXT NOT NULL, evidence TEXT NOT NULL); CREATE TABLE IF NOT EXISTS pending_attempts (id TEXT PRIMARY KEY, payload TEXT NOT NULL);');
    if (actual !== ':memory:') for (const file of [actual, actual + '-wal', actual + '-shm']) {
      try { chmodSync(file, 0o600); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  async begin(entry) {
    const pending = safeEntry({ ...entry, status: 'abandoned', usage: normalizeUsage(entry.protocol, undefined), finishedAt: entry.startedAt });
    const payload = canonicalJSON(pending);
    this.#db.exec('BEGIN IMMEDIATE');
    try {
      const done = this.#db.prepare('SELECT payload FROM attempts WHERE id=?').get(pending.id);
      if (done) throw new Error('attempt already settled');
      const prior = this.#db.prepare('SELECT payload FROM pending_attempts WHERE id=?').get(pending.id);
      if (prior && prior.payload !== payload) throw new Error('pending attempt idempotency conflict');
      if (!prior) this.#db.prepare('INSERT INTO pending_attempts(id,payload) VALUES (?,?)').run(pending.id,payload);
      this.#db.exec('COMMIT');
      return freeze({ inserted: !prior, entry: pending });
    } catch (error) { this.#db.exec('ROLLBACK'); throw error; }
  }
  pending() {
    return this.#db.prepare('SELECT payload FROM pending_attempts ORDER BY id').all().map(row => freeze(JSON.parse(row.payload)));
  }
  async recoverPending({ finishedAt }) {
    const instant = at(finishedAt), recovered = [];
    // Explicit startup recovery only after prior process ownership has ended.
    for (const entry of this.pending()) {
      const result = await this.record({ ...entry, status: 'abandoned', finishedAt: instant, errorCode: 'process-interrupted' });
      recovered.push(result.entry);
    }
    return recovered;
  }
  async record(entry) {
    const clean = safeEntry(entry), payload = canonicalJSON(clean);
    this.#db.exec('BEGIN IMMEDIATE');
    try {
      const prior = this.#db.prepare('SELECT payload FROM attempts WHERE id=?').get(clean.id);
      if (prior && prior.payload !== payload) throw new Error('ledger idempotency conflict: attempt id already has different data');
      const pending = this.#db.prepare('SELECT payload FROM pending_attempts WHERE id=?').get(clean.id);
      if (pending) {
        const p = JSON.parse(pending.payload);
        if (p.profileId !== clean.profileId || p.startedAt !== clean.startedAt || canonicalJSON(p.quote) !== canonicalJSON(clean.quote)) throw new Error('settled attempt differs from dispatch snapshot');
      }
      if (!prior) this.#db.prepare('INSERT INTO attempts (id,profile_id,scope_key,started_at,status,payload) VALUES (?,?,?,?,?,?)').run(clean.id,clean.profileId,clean.scopeKey ?? null,clean.startedAt,clean.status,payload);
      this.#db.prepare('DELETE FROM pending_attempts WHERE id=?').run(clean.id);
      this.#db.exec('COMMIT');
      return freeze({ inserted: !prior, entry: clean });
    } catch (error) { this.#db.exec('ROLLBACK'); throw error; }
  }
  async reconcileRejectedHistory(entry){
    const clean=safeEntry(entry);if(clean.stage!=='main-history'||clean.billingDisposition!=='provider-rejected-402')throw Error('unsupported historical reconciliation');
    const row=this.#db.prepare('SELECT payload FROM attempts WHERE id=?').get(clean.id);if(!row)throw Error('original receipt missing');const original=JSON.parse(row.payload);
    if(original.stage!=='main-history'||original.sourceSessionId!==clean.sourceSessionId||original.startedAt!==clean.startedAt||original.cost.status!=='unpriced'||['inputTokens','outputTokens','cacheReadTokens'].some(k=>(original.usage[k]??0)>0))throw Error('historical rejection identity conflict');
    const payload=canonicalJSON(clean),prior=this.#db.prepare('SELECT payload FROM reconciliations WHERE id=?').get(clean.id);if(prior&&prior.payload!==payload)throw Error('reconciliation conflict');
    this.#db.prepare('INSERT OR IGNORE INTO reconciliations (id,original_payload,payload,evidence) VALUES (?,?,?,?)').run(clean.id,row.payload,payload,canonicalJSON(clean.rejectionEvidence));return clean;
  }
  get(id) {
    const row = this.#db.prepare('SELECT payload FROM '+EFFECTIVE+' WHERE id=?').get(id);
    return row ? freeze(JSON.parse(row.payload)) : null;
  }
  list(filters = {}) {
    const w = where(filters); const limit = filters.limit ?? 1000;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100000) throw new Error('invalid ledger list limit');
    return this.#db.prepare('SELECT payload FROM '+EFFECTIVE + w.sql + ' ORDER BY started_at,id LIMIT ?').all(...w.args,limit).map(row => freeze(JSON.parse(row.payload)));
  }
  aggregate(filters = {}) {
    const w = where(filters), currencies = Object.create(null), profiles = Object.create(null);
    const result = { attempts: 0, statusCounts: Object.create(null), reasoningKnownAttempts: 0, pendingAttempts: this.#db.prepare('SELECT COUNT(*) AS count FROM pending_attempts').get().count, usageKnown: 0, usagePartial: 0, usageUnknown: 0,
      pricedAttempts: 0, nonBillableAttempts:0, rejectedAttempts:0, notDispatchedAttempts:0, unpricedReasons:Object.create(null), upperBoundAttempts: 0, unpricedAttempts: 0, tokens: { input: 0, cold: 0, cacheRead: 0, cacheWrite: 0, output: 0, reasoning: 0 }, cacheHitRatio: null, currencies, profiles };
    for (const row of this.#db.prepare('SELECT payload FROM '+EFFECTIVE + w.sql + ' ORDER BY started_at,id').iterate(...w.args)) {
      const e = JSON.parse(row.payload); result.attempts++; result.statusCounts[e.status] = (result.statusCounts[e.status] ?? 0) + 1;
      const p = profiles[e.profileId] ??= { attempts: 0, pricedAttempts: 0, unpricedAttempts: 0, currencies: Object.create(null) }; p.attempts++;
      result[e.usage.status === 'known' ? 'usageKnown' : e.usage.status === 'partial' ? 'usagePartial' : 'usageUnknown']++;
      if (['known','partial'].includes(e.usage.status)) for (const [k,v] of [['input','inputTokens'],['cold','uncachedInputTokens'],['cacheRead','cacheReadTokens'],['cacheWrite','cacheWriteTokens'],['output','outputTokens'],['reasoning','reasoningTokens']]) { if (Number.isSafeInteger(e.usage[v])) result.tokens[k] += e.usage[v]; }
      if (e.usage.reasoningTokens !== null) result.reasoningKnownAttempts++;
      if(e.cost.status==='not-billed'){result.nonBillableAttempts++;if(e.billingDisposition==='provider-rejected-402')result.rejectedAttempts++;if(e.billingDisposition==='not-dispatched')result.notDispatchedAttempts++;continue;}
      if (e.cost.status === 'unpriced') { result.unpricedAttempts++; p.unpricedAttempts++;result.unpricedReasons[e.cost.reason??'unknown']=(result.unpricedReasons[e.cost.reason??'unknown']??0)+1; continue; }
      result.pricedAttempts++; p.pricedAttempts++;
      const upper = e.cost.status === 'upper-bound'; if (upper) result.upperBoundAttempts++;
      for (const bag of [currencies,p.currencies]) {
        const c = bag[e.cost.currency] ??= { amount: 0, exactAmount: 0, upperBoundAmount: 0, cacheReadSavings: 0, cacheSavingsUnknownAttempts:0, lowerBoundAmount:0, attempts: 0 };
        c.amount += e.cost.amount; c[upper ? 'upperBoundAmount' : 'exactAmount'] += e.cost.amount; c.lowerBoundAmount+=e.cost.lowerBoundAmount??(upper?0:e.cost.amount);c.cacheReadSavings += e.cost.cacheReadSavings??0;if(e.cost.cacheReadSavings===null)c.cacheSavingsUnknownAttempts++; c.attempts++;
      }
    }
    if (result.tokens.input > 0 && result.usagePartial===0) result.cacheHitRatio = result.tokens.cacheRead / result.tokens.input;
    return freeze(result);
  }
  close() { this.#db.close(); }
}
