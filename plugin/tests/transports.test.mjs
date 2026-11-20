import test from 'node:test';
import assert from 'node:assert/strict';
import { profileCacheScope, validateProfile } from '../src/core/profiles.mjs';
import { buildResponsesRequest, buildResponsesHeaders, collectDSHStream, normalizeDSHUsage, runTransport } from '../src/core/transports.mjs';
const text=t=>({type:'text',text:t});
const snapshot=()=>({sessionId:'main-session',options:{provider:'deepseek',model:'deepseek-flash',reasoningEffort:'high',maxTokens:2048,sessionId:'main-session',messages:[{role:'system',content:[text('stable system')]},{role:'user',content:[text('hello')]},{role:'assistant',content:[text('done')]}],tools:[{name:'read',description:'read',parameters:{type:'object'}}]}});
const profile=protocol=>({id:'profile',label:'Profile',protocol,baseURL:protocol==='responses'?'https://api.example/v1':'https://api.deepseek.com/anthropic',model:'deepseek-flash',accountId:'primary',capabilities:{cacheKey:true,cacheRetention:true,reasoning:true,storage:true,background:true},request:{},cache:{}});
async function* chunks({tool=false,finish='stop'}={}) {
 yield {type:'block-start',index:0,blockType:'reasoning'};
 yield {type:'reasoning-delta',index:0,text:'hidden reasoning'};
 yield {type:'text-delta',index:1,text:'{"suggestion":'};
 yield {type:'text-delta',index:1,text:'"continue"}'};
 yield {type:'block-end',index:1,block:{type:'text',text:'{"suggestion":"continue"}'}};
 if(tool)yield{type:'tool-call-delta',index:2,id:'tool-1',name:'read',argumentsDelta:'{}'};
 yield {type:'usage',usage:{inputTokens:100,cacheReadTokens:900,cacheWriteTokens:0,outputTokens:30,reasoningTokens:20}};
 yield {type:'finish',reason:{kind:finish}};
}
const wireUsage={input_tokens:1000,input_tokens_details:{cached_tokens:900},output_tokens:30,output_tokens_details:{reasoning_tokens:20}};
function response(events,{fragment=13,crlf=false}={}) {
 const bytes=new TextEncoder().encode(events.map(e=>'data: '+(typeof e==='string'?e:JSON.stringify(e))+'\n\n').join('').replaceAll('\n',crlf?'\r\n':'\n'));
 return new Response(new ReadableStream({start(controller){for(let n=0;n<bytes.length;n+=fragment)controller.enqueue(bytes.slice(n,n+fragment));controller.close();}}),{status:200,headers:{'content-type':'text/event-stream'}});
}
test('DSH stream collection uses disjoint input, does not double text or reasoning, and flags tools',async()=>{
 let usage;
 const r=await collectDSHStream(chunks({tool:true}),{onUsage:x=>{usage=x}});
 assert.equal(r.text,'{"suggestion":"continue"}');assert.equal(r.toolCalled,true);
 assert.equal(r.usage.inputTokens,1000);assert.equal(r.usage.uncachedInputTokens,100);
 assert.equal(r.usage.outputTokens,30);assert.equal(r.usage.reasoningTokens,20);assert.equal(usage,r.usage);
 assert.equal(normalizeDSHUsage({inputTokens:10,outputTokens:2}).status,'partial');
});
test('parent stream inherits exact context and session affinity, appending only prediction input',async()=>{
 const s=snapshot(),prior=JSON.stringify(s);let received;
 const r=await runTransport(null,s,'predict',{parentStream:options=>{received=options;return chunks();}});
 assert.equal(received.model,s.options.model);assert.equal(received.tools,s.options.tools);
 assert.equal(received.messages[0],s.options.messages[0]);assert.deepEqual(received.messages.at(-1),{role:'user',content:[text('predict')]});
 assert.equal(received.sessionId,'main-session');assert.equal(JSON.stringify(s),prior);assert.equal(r.requestMode,'parent-adapter');
});
test('official DeepSeek adapter resolves options without environment fallback and preserves replay',async()=>{
 const s=snapshot();s.options.messages[2].source={kind:'model',provider:'deepseek',model:'deepseek-flash',replayState:{opaque:'kept'}};
 let received,resolved,captured,auth;const p=profile('deepseek-messages');
 const deepSeekModule={
  resolveAdapterOptions(config,env){assert.equal(env,undefined);assert.equal(config.baseURL,p.baseURL);resolved={...config,validated:true};return resolved;},
  DeepSeekAdapter:class{
   constructor(options){captured=options;}
   stream(options){received=options;return chunks();}
  }
 };
 const r=await runTransport(p,s,'predict',{credential:'memory-secret',deepSeekModule});
 assert.equal(captured.options(),resolved);auth=await captured.resolveAuth();
 assert.equal(auth.headers['x-api-key'],'memory-secret');assert.equal(captured.resolveUserId(),'primary');
 const extension=await captured.prepareExtensions({});assert.deepEqual(extension.fields,{});assert.equal(typeof extension.accept,'function');
 assert.equal(received.messages[2],s.options.messages[2]);assert.equal(received.tools,s.options.tools);
 assert.equal(r.extensionReplay,'omitted-no-hook');assert.ok(!JSON.stringify(r).includes('memory-secret'));
 const prepare=async()=>({fields:{custom:'preserved'},accept:async()=>{}});
 await runTransport(p,s,'predict',{credential:'memory-secret',deepSeekModule,deepSeekHooks:{prepareExtensions:prepare}});
 assert.equal(captured.prepareExtensions,prepare);
});
test('Responses native replay preserves conditioning and cache affinity; profile overrides explicit',()=>{
 const s=snapshot();s.responsesBody={model:'old',input:[{role:'system',content:'same'},{type:'reasoning',encrypted_content:'opaque'}],tools:[{type:'function',name:'read',parameters:{}}],reasoning:{effort:'high'},prompt_cache_key:'main-affinity',prompt_cache_retention:'24h',store:true};
 const before=JSON.stringify(s),p=profile('responses');p.cache.prompt_cache_key='different-profile-key';
 const {body,requestMode}=buildResponsesRequest(p,s,'预测');
 assert.equal(requestMode,'responses-native-replay');assert.equal(body.prompt_cache_key,'main-affinity');
 assert.equal(body.input[1].encrypted_content,'opaque');assert.deepEqual(body.tools,s.responsesBody.tools);
 assert.equal(body.input.at(-1).content[0].text,'预测');assert.equal(body.store,false);assert.equal(body.background,false);
 assert.equal(JSON.stringify(s),before);
 assert.equal(buildResponsesRequest({...p,request:{maxTokens:128}},s,'predict').body.max_output_tokens,128);
});
test('Responses conservative text/tool translation rejects image/reasoning/replay/dynamic/incomplete history',()=>{
 const s=snapshot(),p=profile('responses');s.promptCacheKey='parent-affinity';
 const normal=buildResponsesRequest(p,s,'predict');
 assert.equal(normal.requestMode,'responses-translated');assert.equal(normal.body.prompt_cache_key,'parent-affinity');
 assert.equal(normal.body.tools[0].type,'function');assert.equal(normal.body.reasoning.effort,'high');
 for(const block of [{type:'image',attachment:{attachmentId:'image'}},{type:'reasoning',text:'secret'}]){
  const bad=snapshot();bad.options.messages[1].content=[block];assert.throws(()=>buildResponsesRequest(p,bad,'predict'),/text-only/);
 }
 const replay=snapshot();replay.options.messages[2].source={kind:'model',replayState:{opaque:true}};
 assert.throws(()=>buildResponsesRequest(p,replay,'predict'),/metadata/);
 const tools=snapshot();tools.options.messages.push({role:'assistant',content:[{type:'tool-call',id:'call-1',name:'read',arguments:'{}'}]},{role:'tool',toolCallId:'call-1',content:[text('result')],isError:false});
 assert.equal(buildResponsesRequest(p,tools,'predict').body.input.at(-2).type,'function_call_output');
 tools.options.messages.pop();assert.throws(()=>buildResponsesRequest(p,tools,'predict'),/unresolved/);
 const forced=snapshot();forced.responsesBody={input:[],tool_choice:'required'};assert.throws(()=>buildResponsesRequest(p,forced,'predict'),/forced/);
 forced.responsesBody={input:[],conversation:'main'};assert.throws(()=>buildResponsesRequest(p,forced,'predict'),/persistent/);
});
test('Responses SSE handles fragmented UTF8, CRLF, final usage, tool flags and exactly one physical fetch',async()=>{
 let calls=0,received,seenUsage;
 const r=await runTransport(profile('responses'),snapshot(),'predict',{credential:'memory-secret',onUsage:u=>{seenUsage=u},fetchImpl:async(url,options)=>{
  calls++;received={url,options};return response([{type:'response.output_text.delta',delta:'{"suggestion":"继续"}'},{type:'response.output_item.added',item:{type:'function_call'}},{type:'response.completed',response:{usage:wireUsage,output:[{type:'message',content:[{type:'output_text',text:'{"suggestion":"继续"}'}]}]}},'[DONE]'],{fragment:1,crlf:true});
 }});
 assert.equal(calls,1);assert.equal(received.url,'https://api.example/v1/responses');
 assert.equal(received.options.headers.authorization,'Bearer memory-secret');assert.equal(received.options.redirect,'error');
 assert.equal(r.text,'{"suggestion":"继续"}');assert.equal(r.toolCalled,true);assert.equal(r.usage.inputTokens,1000);
 assert.equal(r.usage.uncachedInputTokens,100);assert.equal(seenUsage,r.usage);
 assert.ok(!JSON.stringify(r).includes('memory-secret'));
});
test('truncated/error responses preserve observed usage, never retry or return incomplete output',async()=>{
 let seen;
 const r=await runTransport(profile('responses'),snapshot(),'predict',{credential:'key',onUsage:u=>seen=u,fetchImpl:async()=>response([{type:'response.incomplete',response:{usage:wireUsage,incomplete_details:{reason:'max_output_tokens'},output:[]}}])});
 assert.equal(r.finishReason,'max_tokens');assert.equal(seen.status,'known');
 await assert.rejects(runTransport(profile('responses'),snapshot(),'predict',{credential:'key',onUsage:u=>seen=u,fetchImpl:async()=>response([{type:'response.failed',response:{usage:wireUsage}}])}),e=>e.code==='PROVIDER_ERROR');
 assert.equal(seen.inputTokens,1000);
 await assert.rejects(runTransport(profile('responses'),snapshot(),'predict',{credential:'key',fetchImpl:async()=>response([{type:'response.output_text.delta',delta:'partial'}])}),e=>e.code==='STREAM_CLOSED');
 let calls=0;await assert.rejects(runTransport(profile('responses'),snapshot(),'predict',{credential:'key',fetchImpl:async()=>{calls++;return new Response('provider details',{status:429})}}),e=>e.code==='RATE_LIMIT');
 assert.equal(calls,1);
});
test('usage callback survives cancellation and non-cooperating stream cannot block caller abort',async()=>{
 const controller=new AbortController();let usage;
 await assert.rejects(collectDSHStream(chunks(),{signal:controller.signal,onUsage:u=>{usage=u;controller.abort(Object.assign(new Error('timeout'),{code:'TIMEOUT'}));}}),e=>e.code==='TIMEOUT');
 assert.equal(usage.inputTokens,1000);
 const cancel=new AbortController();
 const never={ [Symbol.asyncIterator](){return {next:()=>new Promise(()=>{}),return:()=>new Promise(()=>{})};} };
 const pending=collectDSHStream(never,{signal:cancel.signal});cancel.abort(new Error('stop'));
 await assert.rejects(pending,/stop/);
 await assert.rejects(collectDSHStream((async function*(){yield{type:'finish',reason:{kind:'stop'}};yield{type:'text-delta',index:0,text:'extra'};})()),e=>e.code==='MALFORMED_STREAM');
});
test('native Codex mode requires explicit sampleThread capability, never simulates child requests',async()=>{
 const p=profile('codex-native');await assert.rejects(runTransport(p,snapshot(),'predict'),e=>e.code==='NATIVE_CAPABILITY_REQUIRED');
 let args;const result=await runTransport(p,snapshot(),'predict',{nativeBridge:{sampleThread:async x=>{args=x;return{text:'{"suggestion":null}',toolCalled:false,finishReason:'stop'}}}});
 assert.equal(args.snapshot.sessionId,'main-session');assert.equal(result.requestMode,'codex-native-bridge');
});

test('explicit portable migration keeps visible facts and complete tool pairs with removal metadata',async()=>{
 const p=profile('responses');p.request.historyMode='portable-text';
 const s=snapshot();s.options.tools[0].deferLoading=true;
 s.options.toolHistory={tools:s.options.tools,updates:[{messageId:'tools-update',additions:s.options.tools}]};
 s.options.messages[2]={role:'assistant',source:{kind:'model',provider:'deepseek',model:'deepseek-flash',replayState:{signature:'DO_NOT_FORWARD'}},content:[{type:'reasoning',text:'private reasoning'},text('visible fact'),{type:'tool-call',id:'read-1',name:'read',arguments:'{}'}]};
 s.options.messages.push({role:'tool',toolCallId:'read-1',isError:true,content:[text('file missing')]},{role:'developer',content:[{type:'tool-addition',toolName:'read'},{type:'tool-removal',toolName:'old'}]},{role:'assistant',content:[text('Choose another file.')]});
 const original=JSON.stringify(s),built=buildResponsesRequest(p,s,'predict'),bodyText=JSON.stringify(built.body);
 assert.equal(built.requestMode,'portable-cross-backend');
 assert.equal(built.migration.removed.providerReplayMetadata,1);assert.equal(built.migration.removed.reasoningBlocks,1);
 assert.equal(built.migration.removed.toolUpdateBlocks,2);assert.equal(built.migration.removed.encodedToolErrors,1);
 assert.ok(bodyText.includes('visible fact'));assert.ok(bodyText.includes('file missing'));assert.ok(bodyText.includes('is_error'));
 assert.ok(!bodyText.includes('DO_NOT_FORWARD'));assert.ok(!bodyText.includes('private reasoning'));
 assert.ok(!bodyText.includes('deferLoading'));assert.equal(JSON.stringify(s),original);
 const result=await runTransport(p,s,'predict',{credential:'key',fetchImpl:async()=>response([{type:'response.completed',response:{usage:wireUsage,output:[]}}])});
 assert.equal(result.migration.removed.reasoningBlocks,1);
 const strict={...p,request:{}};assert.throws(()=>buildResponsesRequest(strict,s,'predict'),/dynamic tool/);
 const image=snapshot();image.options.messages[1].content=[{type:'image',attachment:{attachmentId:'i'}}];
 assert.throws(()=>buildResponsesRequest(p,image,'predict'),/text-only/);
 const malformed=snapshot();malformed.options.messages.push({role:'tool',toolCallId:'missing',content:[text('fact')]});
 assert.throws(()=>buildResponsesRequest(p,malformed,'predict'),/matching call/);
});

test('external DeepSeek requests require exact projection hook for files, images and deferred tool updates',async()=>{
 const p=profile('deepseek-messages'),s=snapshot();s.options.messages[1].content=[{type:'file',attachment:{attachmentId:'file-1'}}];
 let received,invoked=0;
 const deepSeekModule={resolveAdapterOptions:config=>({...config,models:[{id:p.model,inputModalities:['text'],toolUpdate:'addition-only'}]}),DeepSeekAdapter:class{stream(options){received=options;return chunks();}}};
 await assert.rejects(runTransport(p,s,'predict',{credential:'key',deepSeekModule}),e=>e.code==='PROJECTION_REQUIRED');
 const before=JSON.stringify(s),signal=new AbortController().signal;
 const result=await runTransport(p,s,'predict',{credential:'key',signal,deepSeekModule,projectDSHOptions:async(options,resolved)=>{
  invoked++;assert.equal(resolved.models[0].toolUpdate,'addition-only');assert.equal(options.messages.at(-1).content[0].text,'predict');
  options.messages[1].content=[text('canonical saved file path')];options.tools[0].deferLoading=true;return options;
 }});
 assert.equal(invoked,1);assert.equal(JSON.stringify(s),before);
 assert.equal(received.messages[1].content[0].text,'canonical saved file path');assert.equal(received.signal,signal);
 assert.equal(result.requestMode,'deepseek-official-adapter-projected');
 await assert.rejects(runTransport(p,s,'predict',{credential:'key',deepSeekModule,projectDSHOptions:async options=>({...options,model:'different'})}),e=>e.code==='INVALID_PROJECTION');
 const changed=snapshot();changed.options.messages.push({role:'developer',content:[{type:'tool-addition',toolName:'read'}]});
 await assert.rejects(runTransport(p,changed,'predict',{credential:'key',deepSeekModule}),e=>e.code==='PROJECTION_REQUIRED');
});

test('parent cache affinity is stable by default and long session identities hash deterministically',()=>{
 const p=profile('responses'),s=snapshot();
 const first=buildResponsesRequest(p,s,'prediction one').body,second=buildResponsesRequest(p,s,'prediction two').body;
 assert.equal(first.prompt_cache_key,'main-session');assert.equal(second.prompt_cache_key,first.prompt_cache_key);
 s.options.sessionId='session-'.repeat(20);s.sessionId='wrong-ui-fallback';
 const long1=buildResponsesRequest(p,s,'first').body.prompt_cache_key,long2=buildResponsesRequest(p,s,'second').body.prompt_cache_key;
 assert.equal(long1.length,64);assert.equal(long1,long2);
 s.responsesBody={input:[],prompt_cache_key:'native-parent-key',tool_choice:'none'};
 const native=buildResponsesRequest(p,s,'predict').body;
 assert.equal(native.prompt_cache_key,'native-parent-key');assert.equal(native.tool_choice,'none');
});
test('explicit Responses headers preserve parent routing without auth override or newline injection',()=>{
 const p=profile('responses'),s=snapshot();p.cache.sessionHeader='session_id';p.request.headers={'OpenAI-Beta':'responses=v1','chatgpt-account-id':'account-1'};
 const h=buildResponsesHeaders(p,s,'memory-secret');
 assert.equal(h.session_id,'main-session');assert.equal(h['openai-beta'],'responses=v1');
 assert.equal(h['chatgpt-account-id'],'account-1');assert.equal(h.authorization,'Bearer memory-secret');
 s.responsesHeaders={'session_id':'native-parent-wire-id','authorization':'DO_NOT_REPLAY','Host':'wrong-host','OpenAI-Beta':'old-version'};
 const native=buildResponsesHeaders(p,s,'active-secret');
 assert.equal(native.session_id,'native-parent-wire-id');assert.equal(native.authorization,'Bearer active-secret');
 assert.equal(native.host,undefined);assert.equal(native['openai-beta'],'responses=v1');
 for(const name of ['Authorization','content-type','Host','Cookie','session_id']){
  assert.throws(()=>buildResponsesHeaders({...p,request:{headers:{[name]:'override'}}},s,'key'),e=>e.code==='PROTECTED_HEADER');
 }
 assert.throws(()=>buildResponsesHeaders({...p,request:{headers:{'OpenAI-Beta':'value\r\nx-injected: true'}}},s,'key'),e=>e.code==='INVALID_HEADER');
 assert.throws(()=>buildResponsesHeaders({...p,request:{headers:{'bad\nname':'value'}}},s,'key'),e=>e.code==='INVALID_HEADER');
 assert.throws(()=>buildResponsesHeaders(p,s,'bad\r\nsecret'),e=>e.code==='INVALID_HEADER');
 const base={version:1,...p,credential:{env:'RESPONSE_KEY'}};
 const scope=profileCacheScope(validateProfile(base));
 assert.notEqual(profileCacheScope(validateProfile({...base,request:{...p.request,headers:{...p.request.headers,'chatgpt-account-id':'account-2'}}})),scope);
 assert.notEqual(profileCacheScope(validateProfile({...base,cache:{sessionHeader:'session-id'}})),scope);
});


test('packaged official DeepSeek serializer keeps parent wire prefix/config with mocked network only',async()=>{
 const mod=await import('../lib/dsh-native.mjs'),originalFetch=globalThis.fetch,calls=[];
 const events=[
  {type:'message_start',message:{usage:{input_tokens:100,cache_read_input_tokens:900,cache_creation_input_tokens:0,output_tokens:0}}},
  {type:'content_block_start',index:0,content_block:{type:'text',text:''}},
  {type:'content_block_delta',index:0,delta:{type:'text_delta',text:'{"suggestion":"continue"}'}},
  {type:'content_block_stop',index:0},
  {type:'message_delta',delta:{stop_reason:'end_turn'},usage:{input_tokens:100,cache_read_input_tokens:900,cache_creation_input_tokens:0,output_tokens:30}},
  {type:'message_stop'}
 ];
 globalThis.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body),headers:options.headers});return response(events);};
 try{
  const p=profile('deepseek-messages'),s=snapshot(),resolved=mod.resolveAdapterOptions({baseURL:p.baseURL},undefined);
  s.options.messages[2].source={kind:'model',provider:'deepseek',model:'deepseek-flash'};
  const adapter=new mod.DeepSeekAdapter({options:()=>resolved,resolveAuth:async()=>({headers:{'x-api-key':'test-only-mock'}}),resolveUserId:()=>p.accountId,prepareExtensions:async()=>({fields:{},accept:async()=>{}})});
  await collectDSHStream(adapter.stream(s.options));
  const result=await runTransport(p,s,'predict',{credential:'test-only-mock'});
  assert.equal(calls.length,2);assert.equal(calls[1].url,'https://api.deepseek.com/anthropic/v1/messages');
  assert.equal(calls[1].headers['x-deepseek-harness-session-id'],'main-session');
  assert.equal(calls[1].body.system,calls[0].body.system);
  assert.deepEqual(calls[1].body.tools,calls[0].body.tools);
  assert.deepEqual(calls[1].body.thinking,calls[0].body.thinking);
  assert.deepEqual(calls[1].body.output_config,calls[0].body.output_config);
  assert.deepEqual(calls[1].body.messages.slice(0,-1),calls[0].body.messages);
  assert.equal(calls[1].body.messages.at(-1).content[0].text,'predict');
  assert.equal(result.usage.inputTokens,1000);assert.equal(result.usage.uncachedInputTokens,100);
 }finally{globalThis.fetch=originalFetch;}
});
