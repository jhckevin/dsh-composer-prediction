
/** Counts visible suggestion text, separately from billed reasoning and JSON. */
export function selectedTokenizer(profile,snapshot){
 const mode=profile?.cache?.tokenizer??'auto',model=profile?.model??snapshot.options.model;
 return mode==='auto'?(model==='deepseek-flash'?'deepseek-v41':model==='deepseek-v4-pro'?'deepseek-v4':/^gpt-4o(?:-|$)|^o[134](?:-|$)/.test(model)?'o200k_base':'utf8-upper-bound'):mode;
}
export async function resolveCounter(profile,snapshot){
 const selected=selectedTokenizer(profile,snapshot);
 if(selected==='utf8-upper-bound')return {name:'utf8-byte-upper-bound',exact:false,unit:'UTF-8 bytes',count:text=>Buffer.byteLength(text,'utf8')};
 return (await import('../../lib/tokenizer-runtime.mjs')).counterFor(selected);
}
