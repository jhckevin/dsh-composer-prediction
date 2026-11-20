/** Conservative process-local reservation gate backed by durable usage accounting.
 * One gate owns all dispatches in its plugin instance. The host process lock supplies exclusivity;
 * this module does not claim cross-process distributed budget enforcement.
 */
function fail(message) { throw new Error(message); }
function limits(value) {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('budget limits must be a currency map or null');
  const result=Object.create(null);
  for(const [currency,amount] of Object.entries(value)){
    if(!/^[A-Z]{3}$/.test(currency)||!Number.isFinite(amount)||amount<0)fail('invalid currency budget limit');
    result[currency]=amount;
  }
  return Object.keys(result).length ? Object.freeze(result) : null;
}
function nonnegativeInteger(x) { return Number.isSafeInteger(x)&&x>=0; }
// Round reservations upward to a trillionth of a currency unit; never round displayed cents before admission.
function up(x) { return Math.ceil(x*1e12)/1e12; }
function frozen(value) { return Object.freeze(value); }
export class CostGate {
  #active=new Map();
  constructor({ledger,limitByCurrency=null,scope='scope'}){
    if(typeof ledger?.aggregate!=='function')fail('cost gate requires a usage ledger');
    if(!['scope','global'].includes(scope))fail('invalid budget scope');
    this.ledger=ledger;this.scope=scope;this.limitByCurrency=limits(limitByCurrency);
  }
  configure({limitByCurrency}){
    this.limitByCurrency=limits(limitByCurrency);
    // Existing reservations remain owned until durable settlement, including when disabled.
    return this.limitByCurrency;
  }
  #filters(scopeKey){return this.scope==='global'?{}:{scopeKey};}
  #entry(id,scopeKey){
    if(typeof this.ledger.get==='function')return this.ledger.get(id);
    if(typeof this.ledger.list==='function')return this.ledger.list({...this.#filters(scopeKey),limit:100000}).find(e=>e.id===id)??null;
    return null;
  }
  #facts(scopeKey,currency){
    const aggregate=this.ledger.aggregate(this.#filters(scopeKey));
    const active=[...this.#active.values()].filter(r=>this.scope==='global'||r.scopeKey===scopeKey);
    const pending=typeof this.ledger.pending==='function'?this.ledger.pending().filter(e=>this.scope==='global'||e.scopeKey===scopeKey):null;
    const uncoveredPending=pending?pending.filter(e=>!this.#active.has(e.id)).length:(aggregate.pendingAttempts??0);
    return {
      spent:aggregate.currencies?.[currency]?.amount??0,
      reserved:active.filter(r=>r.currency===currency).reduce((sum,r)=>sum+r.amount,0),
      unpricedAttempts:aggregate.unpricedAttempts??0,
      uncoveredPending
    };
  }
  reserve({id,scopeKey,quote,inputTokenUpperBound,outputTokenUpperBound,cacheWriteMayOccur=false}){
    if(typeof id!=='string'||!id||typeof scopeKey!=='string'||!scopeKey)fail('reservation id and scopeKey are required');
    if(!this.limitByCurrency)return frozen({allowed:true,reason:'budget-disabled',reservation:null});
    if(quote?.status!=='priced'||typeof quote.currency!=='string')return frozen({allowed:false,reason:'price-unknown',reservation:null});
    const currency=quote.currency,limit=this.limitByCurrency[currency];
    if(limit===undefined)return frozen({allowed:false,reason:'currency-limit-missing',currency,reservation:null});
    if(!nonnegativeInteger(inputTokenUpperBound)||!nonnegativeInteger(outputTokenUpperBound))return frozen({allowed:false,reason:'token-upper-bound-missing',currency,reservation:null});
    const rates=quote.rates;
    if(!rates||['input','cacheRead','output'].some(k=>!Number.isFinite(rates[k])||rates[k]<0))return frozen({allowed:false,reason:'rate-unknown',currency,reservation:null});
    if(cacheWriteMayOccur&&(!Number.isFinite(rates.cacheWrite)||rates.cacheWrite<0))return frozen({allowed:false,reason:'cache-write-rate-unknown',currency,reservation:null});
    const inputRate=Math.max(rates.input,rates.cacheRead,Number.isFinite(rates.cacheWrite)?rates.cacheWrite:0);
    const amount=up(inputTokenUpperBound*inputRate/1e6+outputTokenUpperBound*rates.output/1e6);
    if(!Number.isFinite(amount)||amount<0)return frozen({allowed:false,reason:'reservation-overflow',currency,reservation:null});
    const reservation=frozen({id,scopeKey,currency,amount,inputTokenUpperBound,outputTokenUpperBound,inputRate,outputRate:rates.output,priceVersionId:quote.versionId??null});
    const prior=this.#active.get(id);
    if(prior){
      if(JSON.stringify(prior)!==JSON.stringify(reservation))fail('budget reservation idempotency conflict');
      return frozen({allowed:true,reason:'already-reserved',reservation:prior});
    }
    if(this.#entry(id,scopeKey))return frozen({allowed:false,reason:'attempt-already-settled',currency,reservation:null});
    const facts=this.#facts(scopeKey,currency);
    if(facts.unpricedAttempts>0||facts.uncoveredPending>0)return frozen({allowed:false,reason: facts.unpricedAttempts>0?'unreconciled-usage':'unreserved-pending-attempt',currency,...facts,reservation:null});
    const total=up(facts.spent+facts.reserved+amount);
    if(total>limit)return frozen({allowed:false,reason:'budget-exceeded',currency,limit,required:amount,...facts,reservation:null});
    this.#active.set(id,reservation);
    return frozen({allowed:true,reason:'reserved',currency,limit,remaining:Math.max(0,limit-total),reservation});
  }
  release(id,{settled=false,notDispatched=false}={}){
    const reservation=this.#active.get(id);
    if(!reservation)return frozen({released:false,reason:'reservation-not-found'});
    if(notDispatched){
      // This escape is only valid before any network dispatch and before ledger.begin().
      const pending=typeof this.ledger.pending==='function'?this.ledger.pending().some(e=>e.id===id):false;
      if(pending||this.#entry(id,reservation.scopeKey))return frozen({released:false,reason:'attempt-already-recorded'});
      this.#active.delete(id);return frozen({released:true,reason:'not-dispatched'});
    }
    if(!settled)return frozen({released:false,reason:'settlement-unconfirmed'});
    const entry=this.#entry(id,reservation.scopeKey);
    if(!entry)return frozen({released:false,reason:'awaiting-ledger-settlement'});
    if(entry.scopeKey!==reservation.scopeKey||entry.quote?.currency!==reservation.currency)return frozen({released:false,reason:'settlement-scope-mismatch'});
    this.#active.delete(id);
    return frozen({released:true,reason:entry.cost?.status==='unpriced'?'unpriced-ledger-outcome':'settled',actualAmount:entry.cost?.amount??null,currency:reservation.currency});
  }
  state({scopeKey,currency}={}){
    if(!this.limitByCurrency)return frozen({enabled:false,reason:'budget-disabled',activeReservations:this.#active.size});
    if(this.scope==='scope'&&(typeof scopeKey!=='string'||!scopeKey))fail('budget state requires scopeKey');
    const currencies=currency?[currency]:Object.keys(this.limitByCurrency),totals=Object.create(null);
    for(const c of currencies){
      const facts=this.#facts(scopeKey,c);
      totals[c]=frozen({limit:this.limitByCurrency[c]??null,...facts,remaining:this.limitByCurrency[c]===undefined?null:Math.max(0,this.limitByCurrency[c]-facts.spent-facts.reserved)});
    }
    return frozen({enabled:true,scope:this.scope,totals:frozen(totals)});
  }
}
