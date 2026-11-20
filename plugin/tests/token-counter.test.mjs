
import test from 'node:test';import assert from 'node:assert/strict';import {counterFor} from '../lib/tokenizer-runtime.mjs';import {resolveCounter} from '../src/core/token-counter.mjs';import {checkPrediction,POLICY_DEFAULTS} from '../src/core/policy.mjs';
test('bundled V4/V4.1 plain tokenizers agree, and control-token spellings are ordinary text',()=>{
 const a=counterFor('deepseek-v4'),b=counterFor('deepseek-v41');
 for(const s of ['你好，继续验证。','Hello world!','<｜User｜>','🙃e\u0301','C:/test/test.ts','foo_bar 123456'])assert.equal(a.count(s),b.count(s));
 assert(a.count('<｜User｜>')>1);
});
test('real DeepSeek tokenizer enforces 999/1000/1001 visible-token boundaries',async()=>{
 const counter=counterFor('deepseek-v41');
 for(const n of [999,1000,1001]){const text=' hello'.repeat(n);assert.equal(counter.count(text),n);const result=await checkPrediction(text,{policy:{...POLICY_DEFAULTS,languageCheck:false},language:{language:'und'},counter,snapshot:{options:{messages:[]}}});assert.equal(result.ok,n===999)}
});
test('unknown routes are labelled conservative, and explicit encodings never silently remap',async()=>{
 const fallback=await resolveCounter(null,{options:{model:'unknown-custom-model'}});assert.equal(fallback.exact,false);assert.equal(fallback.count('中文'),6);
 const explicit=await resolveCounter({model:'custom',cache:{tokenizer:'cl100k_base'}},{options:{model:'custom'}});assert.match(explicit.name,/cl100k/);
 await assert.rejects(resolveCounter({model:'custom',cache:{tokenizer:'unknown-encoding'}},{options:{model:'custom'}}),{code:'TOKENIZER_UNAVAILABLE'});
});
