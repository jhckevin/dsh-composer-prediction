import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { source,mountHost,collect } from './support/mount-host.mjs';
import * as native from '../lib/dsh-native.mjs';
const {llmCore:core,deepSeekModule:canonical}=source;
const MODEL='deepseek-flash',BASE_URL='https://wire-fixture.invalid/anthropic';
const key='not-a-real-api-key-test-only';
async function evidence(name,calls){
 const safe=calls.map(call=>({...call,headers:Object.fromEntries(Object.entries(call.headers).filter(([key])=>!['x-api-key','authorization'].includes(key)))}));
 await writeFile(new URL('../../.qa/host-integration/'+name+'.json',import.meta.url),JSON.stringify({sourceCommit:'e8f7b93a344964de3dca1ace9e72b6e4d6de87cb',scope:'keyless synthetic fixture; real canonical serializer and plugin transport; synthetic usage is NOT measured cache hit',requests:safe},null,2));
}
function mockFetch(t){
 const calls=[],original=globalThis.fetch;
 globalThis.fetch=async(url,init)=>{
  assert.equal(String(url),BASE_URL+'/v1/messages','unexpected network activity must fail this keyless test');
  const body=JSON.parse(init.body);calls.push({url:String(url),body,headers:Object.fromEntries(new Headers(init.headers))});
  const events=[
   {type:'message_start',message:{id:'fixture-response',model:MODEL,usage:{input_tokens:64,cache_read_input_tokens:960,output_tokens:1}}},
   {type:'content_block_start',index:0,content_block:{type:'text',text:''}},
   {type:'content_block_delta',index:0,delta:{type:'text_delta',text:'{"suggestion":"Continue checking cache hits."}'}},
   {type:'content_block_stop',index:0},
   {type:'message_delta',delta:{stop_reason:'end_turn'},usage:{output_tokens:12}},
   {type:'message_stop'}
  ];
  return new Response(events.map(e=>'event: '+e.type+'\ndata: '+JSON.stringify(e)+'\n\n').join(''),{headers:{'content-type':'text/event-stream'}});
 };
 t.after(()=>{globalThis.fetch=original;});return calls;
}
async function richSession(h,{files=false}={}){
 const session=h.ctx.sessions.create(source.SessionId('wire-parent'));
 session.append('turn/start',{turn:1});session.append('step/start',{turn:1,step:1});
 const config={provider:'deepseek-parent',model:MODEL,reasoningEffort:'high',maxTokens:128,temperature:0.2};
 const read={name:'read',description:'Read a local file',parameters:{type:'object',properties:{path:{type:'string'}}}};
 const search={name:'search',description:'Search locally',parameters:{type:'object',properties:{query:{type:'string'}}},deferLoading:true};
 session.append('request/header',{reason:'initial',header:{config,tools:[read]}});
 session.append('system/message',{turn:1,step:1,message:core.createSystemMessage('stable original system context')},{surfaceOp:'append'});
 const content=[{type:'text',text:'Check the cache, preserve reasoning and tools.'}];
 if(files)content.push(
  {type:'file',attachment:{attachmentId:'sha256:'+'a'.repeat(64),name:'trace.log',bytes:256,mimeType:'text/plain'}},
  {type:'image',attachment:{attachmentId:'sha256:'+'b'.repeat(64),name:'screen.png',bytes:256,mimeType:'image/png',width:32,height:24}});
 session.append('user/message',core.createUserMessage({source:{kind:'user'},content}),{surfaceOp:'append'});
 session.append('assistant/message',{turn:1,step:1,stream:[],message:core.createAssistantMessage({
  source:{provider:'deepseek-parent',model:MODEL,replayState:{response:{kind:'deepseek-messages',version:1,model:MODEL},blocks:[{type:'reasoning',signature:'fixture-native-signed-thinking'},{type:'tool-call'}]}},
  content:[{type:'reasoning',text:'Preserve the inherited prefix.'},{type:'tool-call',id:'tool-call-1',name:'read',arguments:'{"path":"trace.log"}'}]
 })},{surfaceOp:'append'});
 session.append('tool/result',{turn:1,step:1,message:core.createToolResultMessage({callId:'tool-call-1',isError:false,content:[{type:'text',text:'cache hit count: 960'}]})},{surfaceOp:'append'});
 const header=session.append('request/header',{reason:'change',header:{config,tools:[read,search]}});
 session.append('developer/message',{turn:1,step:1,headerSeq:header.seq,message:core.createDeveloperMessage({
  source:{kind:'tool-registry'},content:[{type:'tool-addition',toolName:'search'}]
 })},{surfaceOp:'append'});
 session.append('assistant/message',{turn:1,step:1,stream:[],message:core.createAssistantMessage({source:{provider:'deepseek-parent',model:MODEL},content:[{type:'text',text:'The inherited request has completed.'}]})},{surfaceOp:'append'});
 session.append('step/end',{turn:1,step:1});session.append('turn/end',{turn:1,reason:{kind:'completed'}});
 const agent={id:session.id,session,ctx:h.ctx,status:'idle',options:{},inbox:{nextTurn:[],nextStep:[]}};
 h.ctx.agents.enter(agent);
 const user=session.deriveMessages().find(m=>m.role==='user'&&m.source?.kind==='user');h.controller.userSent(session.id,{id:user.id});h.controller.lifecycle.completed(session.id,{normal:true});
 h.controller.observe({sessionId:session.id,leaseId:'fixture',sequence:1,interaction:1,active:true,ready:true});
 h.controller.state(session.id);
 return {session,snapshot:h.controller.engine.snapshots.get(session.id)};
}
function parentAdapter(connection){
 return new canonical.DeepSeekAdapter({options:()=>connection,resolveAuth:async()=>({headers:{'x-api-key':key}}),resolveUserId:()=> 'fixture-account',
  prepareExtensions:async()=>({fields:{},accept:async()=>{}})});
}
function assertPrefix(parent,predicted,{minimum=false}={}){
 assert.deepEqual(predicted.body.messages.slice(0,parent.body.messages.length),parent.body.messages);
 assert.equal(JSON.stringify(predicted.body.messages.slice(0,parent.body.messages.length)),JSON.stringify(parent.body.messages),'native prefix JSON bytes must match, including schema/block property order');
 assert.equal(predicted.body.messages.length,parent.body.messages.length+1);
 for(const field of (minimum?['model','system','max_tokens','tools','temperature']:['model','system','thinking','output_config','max_tokens','tools','temperature']))
  assert.deepEqual(predicted.body[field],parent.body[field],field+' must preserve inherited cache inputs');
 if(minimum){assert.deepEqual(parent.body.thinking,{type:'enabled'});assert.deepEqual(predicted.body.thinking,{type:'disabled'});assert.equal(predicted.body.output_config,undefined)}
 assert.equal(predicted.headers['x-deepseek-harness-session-id'],'wire-parent');
 assert.equal(predicted.headers['x-deepseek-harness-session-id'],parent.headers['x-deepseek-harness-session-id']);
 assert.equal(predicted.headers['x-deepseek-harness-user-id'],parent.headers['x-deepseek-harness-user-id']);
 assert.equal(predicted.headers['anthropic-beta'],parent.headers['anthropic-beta']);
}
test('canonical pinned DeepSeek parent vs separately bundled custom provider preserves exact native history prefix, thinking signatures, dynamic tools and affinity while disabling future thinking',async t=>{
 assert.notEqual(native.DeepSeekAdapter,canonical.DeepSeekAdapter,'production bundle and canonical reference must be separate module identities');
 const h=await mountHost(t),{session,snapshot}=await richSession(h),calls=mockFetch(t);
 const connection=canonical.resolveAdapterOptions({baseURL:BASE_URL},undefined);
 h.ctx.llm.registerAdapter(['deepseek-parent'],parentAdapter(connection));
 await collect(h.ctx.llm.stream(snapshot.options));
 assert.equal(calls.length,1);
 const profile={version:1,id:'fixture-deepseek',label:'Fixture',protocol:'deepseek-messages',baseURL:BASE_URL,model:MODEL,accountId:'fixture-account',credential:{env:'DSH_WIRE_FIXTURE_KEY'},request:{},cache:{}};
 const old=process.env.DSH_WIRE_FIXTURE_KEY;process.env.DSH_WIRE_FIXTURE_KEY=key;
 t.after(()=>{if(old===undefined)delete process.env.DSH_WIRE_FIXTURE_KEY;else process.env.DSH_WIRE_FIXTURE_KEY=old;});
 await writeFile(join(h.directory,'profiles','fixture.json'),JSON.stringify(profile));
 await h.controller.configure({profileFile:'fixture.json'});
 const result=await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'catch_up'});
 assert.equal(result.suggestion,'Continue checking cache hits.');
 assert.equal(calls.length,2);
 assertPrefix(calls[0],calls[1],{minimum:true});
 await evidence('deepseek-prefix-wire',calls);
 assert.ok(JSON.stringify(calls[1].body).includes('fixture-native-signed-thinking'));
 assert.ok(JSON.stringify(calls[1].body).includes('tool_addition'));
 assert.ok(JSON.stringify(calls[1].body).includes('tool_result'));
 const usage=await h.controller.usage();
 assert.equal(usage.tokens.input,1024);
 assert.equal(usage.tokens.cacheRead,960);
 assert.equal(usage.tokens.output,12);
 const before=calls.length;
 await h.controller.sample({sessionId:session.id,expectedTurnId:1,trigger:'live'});
 assert.equal(calls.length,before,'same source cache reuses result without an extra native request');
});
test('file and image projection matches actual parent LlmRuntime for a text-only route before native serialization',async t=>{
 const h=await mountHost(t),{snapshot}=await richSession(h,{files:true}),calls=mockFetch(t);
 const models=[{id:MODEL,name:'Text fixture',inputModalities:['text'],toolUpdate:'addition-only',systemPromptUpdate:'in-history'}];
 const connection=canonical.resolveAdapterOptions({baseURL:BASE_URL,models},undefined);
 h.ctx.llm.registerAdapter(['deepseek-parent'],parentAdapter(connection));
 await collect(h.ctx.llm.stream(snapshot.options));
 const original=structuredClone(snapshot.options);
 const projected=await source.createDSHProjection(h.ctx,native)(snapshot.options,connection);
 assert.ok(projected.messages.every(m=>m.content.every(b=>b.type!=='file'&&b.type!=='image')));
 const profile={id:'compiled-deepseek',label:'Compiled',protocol:'deepseek-messages',baseURL:BASE_URL,model:MODEL,accountId:'fixture-account',request:{models},cache:{}};
 const result=await source.runTransport(profile,snapshot,'Predict a follow-up.',{
  credential:key,signal:new AbortController().signal,deepSeekModule:native,projectDSHOptions:source.createDSHProjection(h.ctx,native)
 });
 assert.equal(result.text,'{"suggestion":"Continue checking cache hits."}');
 assert.equal(calls.length,2);assertPrefix(calls[0],calls[1]);
 await evidence('deepseek-projected-wire',calls);
 assert.ok(JSON.stringify(calls[1].body).includes('trace.log'));
 assert.ok(JSON.stringify(calls[1].body).includes('attachment sha256:bbbbbbbb'));
 assert.deepEqual(snapshot.options,original,'projection must not rewrite canonical source snapshot');
});

