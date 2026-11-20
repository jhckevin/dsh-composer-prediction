import {randomUUID} from 'node:crypto';
import {UsageLedger,normalizeUsage,quotePrice} from './billing.mjs';
import {normalizeDSHUsage} from './transports.mjs';
export function publicQuote(books,options,at){
 const explicit=books.filter(p=>p.mainRoute?.provider===options.provider&&p.mainRoute?.model===options.model&&(!p.mainRoute.baseURL||p.mainRoute.baseURL===options.baseURL));
 if(explicit.length===1)return {...quotePrice(explicit[0],at),pricingBasis:'explicit-main-route-pricebook'};
 if(explicit.length>1)return null;
 const model=options.model==='deepseek-v4-flash'?'deepseek-flash':options.model;
 const book=books.find(p=>p.model===model);
 if(!book||!['deepseek','deepseek-official'].includes(options.provider)||options.baseURL&&new URL(options.baseURL).origin!=='https://api.deepseek.com')return null;
 return {...quotePrice(book,at),pricingBasis:'public-provider-price-estimate'};
}
export function costShare(prediction,main,{sessionId,coverage='since-install',historyAvailable=false,pending=0}={}){
 const currencies={};const incomplete=(prediction.unpricedAttempts??0)+(main.unpricedAttempts??0)+pending;
 for(const currency of new Set([...Object.keys(prediction.currencies??{}),...Object.keys(main.currencies??{})])){
  const p=prediction.currencies?.[currency],m=main.currencies?.[currency];
  const predictionAmount=p?.amount??0,mainAmount=m?.amount??0,total=predictionAmount+mainAmount;
  const upper=(p?.upperBoundAmount??0)+(m?.upperBoundAmount??0)>0;
  const pl=p?.lowerBoundAmount??Math.max(0,predictionAmount-(p?.upperBoundAmount??0)),ml=m?.lowerBoundAmount??Math.max(0,mainAmount-(m?.upperBoundAmount??0));
  const range=!incomplete&&upper&&total>0?[pl/(mainAmount+pl||1),predictionAmount/(ml+predictionAmount||1)]:null;
  currencies[currency]={predictionShareRange:range,mainUpperBound:(m?.upperBoundAmount??0)>0,predictionUpperBound:(p?.upperBoundAmount??0)>0,totalUpperBound:upper,prediction:predictionAmount,main:mainAmount,total,predictionShare:total>0&&!incomplete&&!upper?predictionAmount/total:null,knownSubtotalShare:total>0?predictionAmount/total:null,complete:!incomplete&&!upper};
 }
 return {sessionId:sessionId??null,formula:'prediction / (main + prediction)',currencies,incompleteAttempts:incomplete,coverage,historyAvailable,estimated:true};
}
function rejectionEvidence(event){
 const chunks=(event.data.stream??[]).map(r=>r.chunk??r),finish=chunks.find(c=>c.type==='finish'&&c.reason?.kind==='error');
 if(finish?.reason?.failure?.status===402&&finish.reason.failure.code==='QUOTA'&&!chunks.some(c=>['usage','reasoning-delta','text-delta','block-start','block-end','tool-call-delta'].includes(c.type))&&!event.data.usage)return {httpStatus:402,code:'QUOTA',streamHadGeneration:false};
 return null;
}
export class ThreadAccounting{
 constructor({path,books,resolveBooks,resolveOptions,cutoff,readSession,now=()=>Date.now()}){this.ledger=new UsageLedger({path});this.books=books;this.resolveBooks=resolveBooks;this.resolveOptions=resolveOptions;this.cutoff=cutoff;this.readSession=readSession;this.now=now;this.queue=Promise.resolve();this.inflight=new Set();this.historyChecked=new Set()}
 quote(options,at){return publicQuote(this.resolveBooks?.()??this.books,options,at)}
 async *track(options,stream){
  if(!options.sessionId||/^composer-prediction/.test(options.purpose??'')){yield* stream;return}
  const id=randomUUID(),startedAt=new Date(this.now()).toISOString(),quote=this.quote(this.resolveOptions?.(options)??options,startedAt);
  const entry={id,profileId:'main:'+options.provider,sourceSessionId:String(options.sessionId),model:options.model,protocol:'deepseek-messages',stage:'main',billingSource:'main-public-price-estimate',startedAt,quote};
  await this.ledger.begin(entry);let usage=normalizeDSHUsage(null),status='completed',errorCode;
  this.inflight.add(id);
  try{for await(const chunk of stream){if(chunk.type==='usage')usage=normalizeDSHUsage(chunk.usage);if(['reasoning-delta','text-delta','block-start','block-end','tool-call-delta'].includes(chunk.type))entry.generatedContent=true;if(chunk.type==='finish'&&chunk.reason?.kind==='error'&&chunk.reason.failure?.status===402&&chunk.reason.failure?.code==='QUOTA'&&usage.status==='unknown'&&!entry.generatedContent){entry.billingDisposition='provider-rejected-402';entry.rejectionEvidence={httpStatus:402,code:'QUOTA',streamHadGeneration:false}}if(chunk.type==='finish'&&['error','aborted'].includes(typeof chunk.reason==='string'?chunk.reason:chunk.reason?.kind))status='failed';yield chunk}}
  catch(error){status=options.signal?.aborted?'cancelled':'failed';errorCode=String(error.code??'MAIN_CALL_FAILED');throw error}
  finally{await this.ledger.record({...entry,finishedAt:new Date(this.now()).toISOString(),status,usage,...errorCode?{errorCode}:{}});this.inflight.delete(id)}
 }
 invalidateHistory(sessionId){this.historyChecked.delete(sessionId)}
 async backfill(sessionId){
  if(this.historyChecked.has(sessionId))return true;
  if(!this.readSession)return false;
  let snapshot;try{snapshot=await this.readSession(sessionId)}catch{return false}
  const existing=new Set(this.ledger.list({sourceSessionId:sessionId,limit:100000}).map(e=>e.id));
  let config={},starts=new Map();
  for(const event of snapshot.events??[]){
   if(event.type==='request/header')config=event.data.header.config;
   if(event.type==='step/start')starts.set(event.data.turn+':'+event.data.step,event.time);
   if(event.seq<(snapshot.inheritedEventCount??0)||event.time>=this.cutoff||!['assistant/message','assistant/attempt'].includes(event.type))continue;
   const id='history:'+sessionId+':'+event.seq,rejected=rejectionEvidence(event);if(existing.has(id)){if(rejected){const old=this.ledger.get(id);if(old?.cost.status==='unpriced')await this.ledger.reconcileRejectedHistory({...old,status:'failed',billingDisposition:'provider-rejected-402',rejectionEvidence:rejected})}continue;}
   const samples=(event.data.stream??[]).map(r=>r.chunk??r).filter(c=>c.type==='usage');
   const raw=event.data.usage??samples.at(-1)?.usage;
   const at=starts.get(event.data.turn+':'+event.data.step)??event.time;
   const startedAt=new Date(at).toISOString(),source=event.data.message?.source??config;
   const options={...config,...source};
   const entry={id,profileId:'main:'+String(options.provider??'unknown'),sourceSessionId:sessionId,sourceTurnId:String(event.data.turn),model:String(options.model??'unknown'),protocol:'deepseek-messages',stage:'main-history',billingSource:'historical-public-price-estimate',startedAt,finishedAt:new Date(event.time).toISOString(),quote:this.quote(options,startedAt),status:rejected||(event.data.stream??[]).some(r=>(r.chunk??r).type==='finish'&&(r.chunk??r).reason?.kind==='error')?'failed':'completed',usage:normalizeDSHUsage(raw),...rejected?{billingDisposition:'provider-rejected-402',rejectionEvidence:rejected}:{}};
   await this.ledger.record(entry);existing.add(id);
  }
  this.historyChecked.add(sessionId);if(this.historyChecked.size>512)this.historyChecked.delete(this.historyChecked.values().next().value);
  return true;
 }
 async summary(predictionLedger,sessionId,filters={}){
  // Serialize historical imports; reads never duplicate receipts across refreshes.
  const work=this.queue.then(()=>sessionId?this.backfill(sessionId):false);this.queue=work.catch(()=>{});
  const historyAvailable=await work;
  const scoped=sessionId?{sourceSessionId:sessionId}:{};
  filters=Object.fromEntries(['since','until'].filter(k=>filters[k]!==undefined).map(k=>[k,filters[k]]));
  const prediction=predictionLedger.aggregate({...filters,...scoped}),main=this.ledger.aggregate({...filters,...scoped});
  const pending=[...predictionLedger.pending(),...this.ledger.pending()].filter(p=>!sessionId||p.sourceSessionId===sessionId).length;
  const since=new Date(this.cutoff).toISOString(),liveFilters={...filters,since:filters.since&&filters.since>since?filters.since:since,...scoped};
  const livePrediction=predictionLedger.aggregate(liveFilters),liveMain=this.ledger.aggregate(liveFilters);
  return {prediction,main,sinceInstall:{...costShare(livePrediction,liveMain,{sessionId,coverage:'since-install',pending}),predictionAttempts:livePrediction.attempts,mainAttempts:liveMain.attempts},unpricedReasons:{main:main.unpricedReasons,prediction:prediction.unpricedReasons},share:costShare(prediction,main,{sessionId,coverage:historyAvailable?'historical-log-plus-live':'since-install',historyAvailable,pending}),trackingStartedAt:new Date(this.cutoff).toISOString()};
 }
 async close(){await this.queue;this.ledger.close()}
}
