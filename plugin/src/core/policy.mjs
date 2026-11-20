
import { createHash } from 'node:crypto';
export const POLICY_DEFAULTS = Object.freeze({reasoningMode:'minimum',automaticRetry:true,networkRetryLimit:3,validationRepairLimit:1,maxSuggestionTokens:999,lengthMode:'normal',preferredSuggestionTokens:160,truncationEnabled:false,languageCheck:true,predictionLanguage:'auto',rejectExplanations:true,userViewpointCheck:true,retryBaseDelayMs:400,retryMaxDelayMs:10000,repairCompressionRatio:0.9,repairMaxOutputTokens:4096,maxRepairInputBytes:16384,instructionMaxBytes:8192,repairStrategy:'auto',repairMinSavingsRatio:0.05,repairCacheDiscount:0.8,repairCacheTtlMs:300000});
export const POLICY_KEYS=Object.keys(POLICY_DEFAULTS);
export function validatePolicy(p){
 if(p.reasoningMode!==undefined&&!['minimum','configured'].includes(p.reasoningMode))throw Error('Invalid reasoning mode');
 for(const k of ['automaticRetry','truncationEnabled','languageCheck','rejectExplanations','userViewpointCheck'])if(p[k]!==undefined&&typeof p[k]!=='boolean')throw Error('Invalid '+k);
 for(const [k,min,max] of [['networkRetryLimit',0,3],['validationRepairLimit',0,1],['maxSuggestionTokens',1,8192],['preferredSuggestionTokens',1,8192],['retryBaseDelayMs',0,10000],['retryMaxDelayMs',0,30000],['repairMaxOutputTokens',32,16384],['maxRepairInputBytes',256,65536],['instructionMaxBytes',0,8192],['repairCacheTtlMs',1000,3600000]])if(p[k]!==undefined&&(!Number.isInteger(p[k])||p[k]<min||p[k]>max))throw Error('Invalid '+k);
 if(p.repairStrategy!==undefined&&!['auto','draft-only','parent-regenerate','parent-with-draft'].includes(p.repairStrategy))throw Error('Invalid repair strategy');
 for(const k of ['repairMinSavingsRatio','repairCacheDiscount'])if(p[k]!==undefined&&(!Number.isFinite(p[k])||p[k]<0||p[k]>1))throw Error('Invalid '+k);
 if(p.lengthMode!==undefined&&!['short','normal','long','custom'].includes(p.lengthMode))throw Error('Invalid length mode');
 if(p.predictionLanguage!==undefined&&p.predictionLanguage!=='auto'&&!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(p.predictionLanguage))throw Error('Invalid prediction language');
 if(p.repairCompressionRatio!==undefined&&(!Number.isFinite(p.repairCompressionRatio)||p.repairCompressionRatio<0.5||p.repairCompressionRatio>0.98))throw Error('Invalid compression ratio');
}
const strip=text=>String(text).replace(/```[\s\S]*?```/g,' ').replace(/`[^`]*`/g,' ').replace(/https?:\/\/\S+|\b[\w.-]+\/[\w/.-]+|\b[\w.-]+\.(?:ts|js|json|py|md|rs|txt)\b/g,' ').replace(/^>.*$/gm,' ');
const TRAD='體這個為與開關閉設測試檢查應該還沒經過實際網絡錯誤處理長度語證據輸較擇優級請繼續讓對話時並從無發現壓縮權確認則';
const SIMP='体这个为与开关闭设测试检查应该还没经过实际网络错误处理长度语证据输较择优级请继续让对话时并从无发现压缩权确认则';
export function detectLanguage(raw){
 const text=strip(raw),count=re=>(text.match(re)??[]).length;
 const han=count(/\p{Script=Han}/gu),kana=count(/[\p{Script=Hiragana}\p{Script=Katakana}]/gu),hangul=count(/\p{Script=Hangul}/gu);
 if(kana>=2)return {language:'ja',confidence:'strong'};
 if(hangul>=2)return {language:'ko',confidence:'strong'};
 if(han>=2){let traditional=0,simplified=0;for(const c of text){if(TRAD.includes(c))traditional++;if(SIMP.includes(c))simplified++}return {language:'zh',script:traditional>=2&&traditional>simplified?'Hant':simplified>=2&&simplified>traditional?'Hans':null,confidence:'strong'}}
 if(count(/\p{Script=Cyrillic}/gu)>=3){
  if(/[їєґ]/iu.test(text))return {language:'uk',confidence:'strong'};
  if(/[ў]/iu.test(text))return {language:'be',confidence:'strong'};
  if(/(?:это|пожалуйста|почему|проверь|нужно|можно|дальше)/iu.test(text))return {language:'ru',confidence:'strong'};
  return {language:'und',confidence:'unknown',scriptFamily:'Cyrl'};
 }
 if(count(/\p{Script=Arabic}/gu)>=3){
  if(/[ٹڈڑںھے]/u.test(text))return {language:'ur',confidence:'strong'};
  if(/[پچژگ]/u.test(text))return {language:'fa',confidence:'strong'};
  if(/(?:هذا|لماذا|الرجاء|يرجى)/u.test(text))return {language:'ar',confidence:'strong'};
  return {language:'und',confidence:'unknown',scriptFamily:'Arab'};
 }
 for(const [language,re]of [['he',/\p{Script=Hebrew}/gu],['th',/\p{Script=Thai}/gu]])if(count(re)>=3)return {language,confidence:'strong'};
 const words=text.toLowerCase().match(/\p{Script=Latin}+/gu)??[];
 const vocabulary={en:['the','please','this','that','with','should','would','can','you','and','how','why','do','not','is','are','your'],fr:['le','la','les','une','des','pour','avec','vous','est'],de:['der','die','das','und','nicht','bitte','ist','ich'],es:['el','los','una','para','con','por','que','puedes'],pt:['não','uma','para','com','você','por','isso']};
 if(words.length===1&&['yes','no','continue','retry','explain','thanks'].includes(words[0]))return {language:'en',confidence:'strong'};
 const scores=Object.entries(vocabulary).map(([language,dict])=>({language,n:words.filter(w=>dict.includes(w)).length})).sort((a,b)=>b.n-a.n);
 if(scores[0].n>=2&&scores[0].n>(scores[1]?.n??0))return {language:scores[0].language,confidence:'strong'};
 return {language:'und',confidence:'unknown'};
}
export function languageContext(snapshot,policy){
 if(policy.predictionLanguage!=='auto'){const [language,...parts]=policy.predictionLanguage.split('-');return {language,script:parts.find(p=>['Hans','Hant'].includes(p))??null,confidence:'explicit'}}
 const messages=snapshot.options?.messages??[];
 const users=messages.filter(m=>m.role==='user'&&(!m.source||m.source.kind==='user'));
 for(const m of users.slice(-5).reverse()){const text=typeof m.content==='string'?m.content:(m.content??[]).filter(b=>b.type==='text').map(b=>b.text).join('\n');const d=detectLanguage(text);if(d.language!=='und')return {...d,source:'recent-user-prose'};if(strip(text).trim().length>=12)return {...d,source:'latest-user-language-uncertain'}}
 return {language:'und',confidence:'unknown',source:'insufficient-language-evidence'};
}
export function parsePrediction(raw){
 if(Buffer.byteLength(raw)>65536)throw Object.assign(Error('Output resource limit'),{code:'OUTPUT_LIMIT'});
 let x;try{x=JSON.parse(raw)}catch{throw Object.assign(Error('Invalid JSON'),{code:'INVALID_SUGGESTION'})}
 if(x===false)return {suggestion:null,abstained:true};
 if(!x||typeof x!=='object'||Array.isArray(x)||!Object.hasOwn(x,'suggestion'))throw Object.assign(Error('Invalid prediction shape'),{code:'INVALID_SUGGESTION'});
 if(x.evidence===false||x.suggestion===false||x.suggestion===null)return {suggestion:null,abstained:true};
 if(typeof x.suggestion!=='string'||(x.evidence!==undefined&&typeof x.evidence!=='boolean'))throw Object.assign(Error('Invalid prediction type'),{code:'INVALID_SUGGESTION'});
 const suggestion=x.suggestion.trim();return {suggestion:suggestion||null,abstained:!suggestion};
}
export async function truncateSuggestion(text,maxTokens,counter){
 const graphemes=Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text),s=>s.segment);
 let lo=0,hi=graphemes.length,best='';
 while(lo<=hi){const mid=Math.floor((lo+hi)/2),s=graphemes.slice(0,mid).join(''),n=await counter.count(s);if(n<=maxTokens){best=s;lo=mid+1}else hi=mid-1}
 const boundary=Math.max(...['。','！','？','；','. ','! ','? ','\n'].map(p=>best.lastIndexOf(p)));
 if(boundary>=Math.floor(best.length*0.6)){const s=best.slice(0,boundary+1).trim();if(s)best=s}
 best=best.trim();
 while(best&&(await counter.count(best))>maxTokens)best=Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(best),x=>x.segment).slice(0,-1).join('').trim();
 return best;
}
export function priceAtoms(text){
 const values=new Set();const number='([0-9]+(?:\\.[0-9]+)?)';
 const label='(?:单价|费率|(?:命中|未命中|输入|输出)价|(?:cached?|input|output|token)?\\s*(?:price|rate))';
 const link='(?:\\s*(?:为|是|等于|按|of|is|at|=|:|：))?\\s*(?:(?:人民币|美元|USD|CNY|RMB)\\s*)?';
 for(const pattern of [new RegExp(label+link+number,'giu'),new RegExp('[¥￥$]\\s*'+number,'gu'),new RegExp(number+'\\s*(?:美元|元|USD|CNY|RMB)(?![A-Za-z])','giu')])for(const match of String(text).matchAll(pattern))values.add(String(Number(match[1])));
 return [...values];
}
export function priceEvidence(snapshot){return [...new Set((snapshot?.options?.messages??[]).filter(m=>m.role==='user'||m.role==='assistant').flatMap(m=>priceAtoms(typeof m.content==='string'?m.content:(m.content??[]).filter(b=>b.type==='text').map(b=>b.text).join('\n'))))];}
export async function checkPrediction(text,{policy,language,counter,snapshot}){
 const issues=[];
 let tokens=await counter.count(text),truncated=false;
 if(!Number.isSafeInteger(tokens)||tokens<0)throw Object.assign(Error('Invalid tokenizer result'),{code:'TOKENIZER_UNAVAILABLE'});
 if(tokens>policy.maxSuggestionTokens&&policy.truncationEnabled){text=await truncateSuggestion(text,policy.maxSuggestionTokens,counter);truncated=true;tokens=await counter.count(text);if(!text)issues.push('EMPTY_AFTER_TRUNCATION')}

 if(!text.replace(/[\s\p{Cf}]/gu,''))issues.push('NO_VISIBLE_CONTENT');
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text))issues.push('CONTROL_CHARACTERS');
 if(/<\/?think>|<\/?analysis>|\[TOOL_CALL\]|<\|(?:assistant|system|user)\|>/i.test(text))issues.push('INTERNAL_OUTPUT');
 if(policy.rejectExplanations&&/^(?:the user (?:would|might|will)|用户(?:可能|应该|会)(?:说|问|发送)|根据(?:上文|对话)|based on (?:the|this) conversation)/iu.test(text))issues.push('NARRATION');
 if(policy.rejectExplanations&&/^(?:suggestion|prediction|assistant|system|分析|建议|预测|助手)\s*[:：]/iu.test(text))issues.push('ROLE_OR_LABEL');
 if(policy.userViewpointCheck&&/^(?:as an ai\b|i (?:will now|am going to) (?:implement|execute|run)|作为(?:一个)?(?:AI|人工智能)|(?:我将|接下来我会)(?:执行|实现|运行))/iu.test(text))issues.push('ASSISTANT_VIEWPOINT');
 const allowedPrices=new Set(priceEvidence(snapshot));if(priceAtoms(text).some(x=>!allowedPrices.has(x)))issues.push('UNSUPPORTED_PRICE_ASSUMPTION');
 const detected=detectLanguage(text);
 if(policy.languageCheck&&language.language!=='und'&&detected.language!=='und'){
  if(language.language!==detected.language)issues.push('LANGUAGE_MISMATCH');
  else if(language.script&&detected.script&&language.script!==detected.script)issues.push('SCRIPT_MISMATCH');
 }
 if(tokens>policy.maxSuggestionTokens)issues.push('TOO_LONG');
 const lastAssistant=[...(snapshot.options?.messages??[])].reverse().find(m=>m.role==='assistant');
 const prose=(lastAssistant?.content??[]);const latest=typeof prose==='string'?prose:prose.filter(b=>b.type==='text').map(b=>b.text).join('\n').trim();
 if(latest&&latest.length>=24&&text===latest)issues.push('ASSISTANT_ECHO');
 return {ok:issues.length===0,text,tokens,truncated,issues:[...new Set(issues)],language:detected,languageVerification:!policy.languageCheck?'disabled':language.language==='und'||detected.language==='und'?'unknown':'checked',counter:counter.name,counterExact:counter.exact!==false};
}
export const instructionDigest=text=>createHash('sha256').update(text).digest('hex');
