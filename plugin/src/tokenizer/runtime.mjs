
import {Tokenizer} from '@huggingface/tokenizers';
import {Tiktoken} from 'js-tiktoken/lite';
import o200k from 'js-tiktoken/ranks/o200k_base';
import cl100k from 'js-tiktoken/ranks/cl100k_base';
import v41 from '../../tokenizers/deepseek-v41.json' with {type:'json'};
// V4 and V4.1 JSON are byte-different only in AddedTokens; stripped plain-text pipelines were compared equal.
const encoders=new Map();let plainTokenizer;
export function counterFor(kind){
 if(encoders.has(kind))return encoders.get(kind);
 let counter;
 if(['deepseek-v41','deepseek-v4'].includes(kind)){
  const json=plainTokenizer?null:structuredClone(v41);
  // User-visible text uses ordinary vocabulary; literal control-token spellings are not AddedTokens.
  if(json){json.added_tokens=[];json.post_processor=null;plainTokenizer=new Tokenizer(json,{})}
  const tokenizer=plainTokenizer;
  counter={name:kind+'-plain-text-pinned',exact:true,count:text=>tokenizer.encode(text,{add_special_tokens:false}).ids.length};
 }else if(['o200k_base','cl100k_base'].includes(kind)){
  const encoding=new Tiktoken(kind==='o200k_base'?o200k:cl100k);counter={name:kind+'-declared-text-encoding',exact:true,count:text=>encoding.encode(text,[],[]).length};
 }else throw Object.assign(Error('Unsupported tokenizer'),{code:'TOKENIZER_UNAVAILABLE'});
 encoders.set(kind,counter);return counter;
}
