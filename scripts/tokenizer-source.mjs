import {Tokenizer} from '@huggingface/tokenizers';
import {Tiktoken} from 'js-tiktoken/lite';
import o200k from 'js-tiktoken/ranks/o200k_base';
import cl100k from 'js-tiktoken/ranks/cl100k_base';
import deepseek from '../plugin/tokenizers/deepseek-v4.json' with {type:'json'};
const cache=new Map();let plain;
export function counterFor(name){
 if(cache.has(name))return cache.get(name);
 let counter;
 if(['deepseek-v41','deepseek-v4'].includes(name)){
  if(!plain){const data=structuredClone(deepseek);data.added_tokens=[];data.post_processor=null;plain=new Tokenizer(data,{})}
  counter={name:name+'-plain-text-pinned',exact:true,count:text=>plain.encode(text,{add_special_tokens:false}).ids.length};
 }else if(['o200k_base','cl100k_base'].includes(name)){
  const encoder=new Tiktoken(name==='o200k_base'?o200k:cl100k);
  counter={name:name+'-declared-text-encoding',exact:true,count:text=>encoder.encode(text,[],[]).length};
 }else throw Object.assign(Error('Unsupported tokenizer'),{code:'TOKENIZER_UNAVAILABLE'});
 cache.set(name,counter);return counter;
}
