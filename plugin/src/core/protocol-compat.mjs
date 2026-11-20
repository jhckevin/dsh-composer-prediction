/** Optional protocol features are declared, never discovered with paid probe calls. */
export function capabilities(profile){
 const official=(()=>{try{return new URL(profile.baseURL).hostname==='api.openai.com'}catch{return false}})();
 return {responseMode:profile.protocol==='responses'?'sse':'json',auth:profile.protocol==='anthropic-messages'?'x-api-key':'bearer',usage:'native',cacheKey:official,cacheRetention:official,reasoning:false,temperature:true,tools:true,storage:official,background:official,...profile.capabilities};
}
export async function boundedText(response,limit=2*1024*1024){
 const reader=response.body?.getReader?.();
 if(!reader)throw Object.assign(Error('Response body unavailable'),{code:'EMPTY_RESPONSE'});
 let size=0,text='';const decoder=new TextDecoder();
 try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>limit)throw Object.assign(Error('Response exceeds local byte limit'),{code:'OUTPUT_LIMIT'});text+=decoder.decode(part.value,{stream:true})}text+=decoder.decode()}
 finally{try{await reader.cancel()}catch{}reader.releaseLock()}
 return text;
}
export async function boundedJSON(response,limit=2*1024*1024){
 const text=await boundedText(response,limit);
 try{return JSON.parse(text)}catch{throw Object.assign(Error('Invalid JSON response'),{code:'MALFORMED_RESPONSE'})}
}
/** Only explicit insufficient-funds evidence arms balance recovery. 429 alone is rate limiting. */
export function providerError(status,data,headers){
 const code=String(data?.error?.code??data?.error?.type??data?.code??data?.type??'').toLowerCase();
 const message=String(data?.error?.message??(typeof data?.error==='string'?data.error:undefined)??data?.message??'');
 const quota=['insufficient_quota','insufficient_balance','credit_balance_too_low','billing_hard_limit_reached','quota','balance_not_enough'].includes(code)||
 /(?:insufficient|not enough|too low|exhausted)\b.{0,24}\b(?:credits?|balance|funds)|\b(?:credit balance|account balance)\b.{0,24}\b(?:too low|insufficient|exhausted)|余额不足|额度不足|配额已用尽/i.test(message);
 const mapped=quota?'QUOTA':[401,403].includes(status)?'AUTH':status===429?'RATE_LIMIT':status===413||/context_length_exceeded|context_window_exceeded/.test(code)?'CONTEXT_LENGTH':'HTTP_'+status;
 const after=headers?.get?.('retry-after'),delay=after==null?undefined:/^\d+(?:\.\d+)?$/.test(after)?Number(after)*1000:Math.max(0,Date.parse(after)-Date.now());
 // Persist status/class only; the remote error message can contain credentials or user text.
 return Object.assign(Error('Provider rejected request: '+mapped),{code:mapped,status,...quota?{quotaExplicit:true}:{},...status>=400&&status<500&&status!==408&&data&&typeof data==='object'&&!data?.usage&&!data?.output?.length&&!data?.choices?.length&&!data?.content?.length?{providerRejected:true,preGenerationRejection:true}:{},...Number.isFinite(delay)?{providerRetryAfterMs:delay}:{}});
}
export async function rejectHTTP(response,onUsage){
 let data;try{const text=await boundedText(response,65536);try{data=JSON.parse(text)}catch{data={message:text}}}catch{}
 if(data?.usage)await onUsage?.(data.usage);
 throw providerError(response.status,data,response.headers);
}
export function usageProtocol(profile){
 return profile.capabilities?.usage==='totals-only'?'totals-only':profile.protocol;
}
