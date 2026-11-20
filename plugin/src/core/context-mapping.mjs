import {createHash} from 'node:crypto';
import {counterFor} from '../../lib/tokenizer-runtime.mjs';
export function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object'){const out={};for(const key of Object.keys(value).sort())if(key!=='signal'&&value[key]!==undefined&&typeof value[key]!=='function')out[key]=canonical(value[key]);return out;}
 return value;
}
export const fingerprint=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const encode=value=>JSON.stringify(canonical(value));
export function counter(model){
 try{return counterFor(model==='deepseek-flash'||model==='deepseek-v4-flash'?'deepseek-v41':model==='deepseek-v4-pro'?'deepseek-v4':/^gpt-4o|^o[134](?:-|$)/.test(model)?'o200k_base':'unsupported');}
 catch{return {name:'utf8-upper-bound',exact:false,count:text=>Buffer.byteLength(text)};}
}
export function paired(messages){
 const calls=new Set();
 for(const m of messages){
  if(m.role==='tool'){if(!m.toolCallId||!calls.delete(m.toolCallId))return false;}
  for(const b of m.content??[])if(b.type==='tool-call'){if(!b.id||calls.has(b.id))return false;calls.add(b.id);}
 }
 return calls.size===0;
}
export function mapContext(options){
 const measure=counter(options.model),{messages=[],sessionId,toolHistory,...header}=options;
 const headerText=encode(header),units=[];let current=[];
 for(const m of messages){
  if(m.role==='user'&&current.some(x=>x.role==='assistant')){units.push(current);current=[];}
  current.push(m);
 }
 if(current.length)units.push(current);
 return {header:fingerprint(header),headerTokens:measure.count(headerText)+32,model:options.model,counter:measure.name,
  exactTextCounter:measure.exact,valid:paired(messages),units:units.map(messages=>({messages,hash:fingerprint(messages),tokens:measure.count(encode(messages))+8})),
  tokens:measure.count(headerText)+32+units.reduce((n,m)=>n+measure.count(encode(m))+8,0)};
}
export function sharedPrefix(a,b){
 if(!a||a.header!==b.header)return 0;
 let n=Math.min(a.headerTokens,b.headerTokens);
 for(let i=0;i<Math.min(a.units.length,b.units.length);i++){if(a.units[i].hash!==b.units[i].hash)break;n+=Math.min(a.units[i].tokens,b.units[i].tokens);}
 return n;
}
export function mappingDescriptor(m){const {header,headerTokens,tokens,model}=m;return {header,headerTokens,tokens,model,units:m.units.map(({hash,tokens})=>({hash,tokens}))};}
export {cadence} from './loop-watchdog.mjs';
export function chooseContext(snapshot,{baseline,predictionBaseline,previousSource,previousPlan,quote,observedHitRatio=0.85,targetTokens=32768,minRetainedCacheRatio=0.5,forceMutation=false,qualityCostSlack=0.05}={}){
 const mapping=mapContext(snapshot.options),limit=Math.max(0,(snapshot.contextWindow??1048576)-(snapshot.options.maxTokens??4096)-512);
 if(!mapping.valid)return {allowed:false,reason:'mapping-tool-pair',mapping};
 const shared=sharedPrefix(baseline,mapping),retainedRatio=baseline?shared/Math.max(1,baseline.tokens):null;
 if(forceMutation&&baseline&&retainedRatio<minRetainedCacheRatio)
  return {allowed:false,reason:'cache-prefix-loss',mapping,retainedRatio,estimated:true};
 const cost=(tokens,hit)=>quote?.status==='priced'?(Math.max(0,tokens-hit)*quote.rates.input+hit*quote.rates.cacheRead)/1e6:null;
 const candidates=[];
 const add=(strategy,units,note,range={})=>{
  if(!units.length||!paired(units.flatMap(x=>x.messages)))return;
  const tokens=mapping.headerTokens+units.reduce((n,u)=>n+u.tokens,0)+384;
  if(tokens>limit)return;
  const mapped={...mapping,units,tokens:tokens-384};
  const reusable=Math.max(sharedPrefix(baseline,mapped),sharedPrefix(predictionBaseline,mapped));
  const confidence=Math.max(0.5,Math.min(0.98,observedHitRatio));
  const hit=Math.floor(Math.min(reusable,tokens)*confidence/64)*64;
  candidates.push({strategy,tokens,estimatedCachedTokens:hit,estimatedInputCost:cost(tokens,hit),optimisticInputCost:cost(tokens,Math.floor(Math.min(reusable,tokens)/64)*64),retainedDialogueUnits:units.length,...range,units,note});
 };
 add('full',mapping.units,null);
 const tailStart=Math.max(0,mapping.units.length-2),tail=mapping.units.slice(tailStart);
 let kept=0;
 if(baseline?.header===mapping.header)while(kept<Math.min(baseline.units.length,tailStart)&&baseline.units[kept].hash===mapping.units[kept].hash)kept++;
 let prefix=mapping.units.slice(0,kept);
 while(prefix.length>1&&mapping.headerTokens+[...prefix,...tail].reduce((n,u)=>n+u.tokens,0)+384>targetTokens)prefix.pop();
 const note='Some older dialogue was omitted. The original first dialogue and the recent complete dialogue are retained. Use only supplied facts and return null if omitted facts or constraints are needed.';
 if(!snapshot.nativeSampling&&prefix.length&&prefix.length+tail.length<mapping.units.length)
  add('prefix-tail',[...prefix,...tail],note,{prefixCount:prefix.length,tailStart});
 if(!snapshot.nativeSampling&&tailStart>1)
  add('local-window',[mapping.units[0],...tail],note,{prefixCount:1,tailStart});
 const old=previousPlan?.decision;
 if(!snapshot.nativeSampling&&old?.strategy!=='full'&&Number.isInteger(old?.tailStart)&&previousSource?.header===mapping.header&&
  previousSource.units.every((u,i)=>u.hash===mapping.units[i]?.hash)){
  const frozen=[...mapping.units.slice(0,old.prefixCount),...mapping.units.slice(old.tailStart)];
  if(mapping.headerTokens+frozen.reduce((n,u)=>n+u.tokens,0)+384<=targetTokens*1.25)
   add('frozen-window',frozen,note,{prefixCount:old.prefixCount,tailStart:old.tailStart});
 }
 const feasible=candidates.filter(x=>x.strategy==='full'||x.strategy==='frozen-window'||x.tokens<=targetTokens);
 const full=feasible.find(x=>x.strategy==='full');
 let chosen;
 if(full&&(!baseline&&!predictionBaseline||full.estimatedInputCost===null))chosen=full;
 else{
  feasible.sort((a,b)=>(a.estimatedInputCost??a.tokens)-(b.estimatedInputCost??b.tokens));
  chosen=feasible[0];
  if(chosen?.estimatedInputCost!=null){
   const band=feasible.filter(x=>x.estimatedInputCost<=chosen.estimatedInputCost*(1+qualityCostSlack)+1e-12);
   band.sort((a,b)=>b.retainedDialogueUnits-a.retainedDialogueUnits||(a.strategy==='frozen-window'?-1:1));
   chosen=band[0];
  }
 }
 if(full&&chosen?.strategy!=='full'&&chosen?.estimatedInputCost!=null&&full.optimisticInputCost!=null&&chosen.estimatedInputCost>=full.optimisticInputCost*0.9)chosen=full;
 if(!chosen)return {allowed:false,reason:'context-limit',mapping,retainedRatio};
 const {units,...decision}=chosen;
 return {allowed:true,mapping,retainedRatio,decision:{...decision,note:undefined,estimated:true,qualityCostSlack,retainedRatio,candidates:candidates.map(({units,note,...x})=>x)},
  options:{...snapshot.options,messages:units.flatMap(x=>x.messages)},contextNote:chosen.note};
}
