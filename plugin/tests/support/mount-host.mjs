import { buildIntegrationBundle } from './build-host.mjs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export const source = await buildIntegrationBundle();
const { Context, Service, SessionStore, SessionProjectionRegistry, AgentRegistry, LlmRuntime, LlmAdapter, HostConnectionService } = source;
export class RecordingAdapter extends LlmAdapter {
  calls=[];
  delay=null;
  script=null;
  async resolveModel(provider,model) {return {provider,id:model,name:model,reasoning:{efforts:[{id:'high',name:'High'}]},toolUpdate:'in-history',inputModalities:['text']};}
  async *stream(options) {
    this.calls.push(options);
    if(this.delay)await this.delay(options);
    if(this.script){yield* this.script(options);return;}
    const text=options.purpose==='composer-prediction'?'{"suggestion":"继续验证缓存命中"}':'parent response';
    yield {type:'block-start',index:0,blockType:'text'};
    yield {type:'text-delta',index:0,text};
    yield {type:'block-end',index:0,block:{type:'text',text}};
    yield {type:'usage',usage:{inputTokens:64,cacheReadTokens:960,cacheWriteTokens:0,outputTokens:12,reasoningTokens:0}};
    yield {type:'finish',reason:{kind:'stop'}};
  }
}
export async function mountHost(t,{plugin=false,enabled=true}={}) {
  const ctx=new Context();
  const directory=await mkdtemp(join(tmpdir(),'dsh-prediction-host-'));
  let closed=false;
  const routes=new Map();
  class TestWebServer extends Service {
    protocol='http:'; host='localhost';
    constructor(inner){super(inner,'webServer');}
    register(route) {if(routes.has(route.path))throw new Error('duplicate test route');routes.set(route.path,route);return ()=>routes.delete(route.path);}
  }
  await ctx.plugin(SessionStore);
  await ctx.plugin(SessionProjectionRegistry);
  await ctx.plugin(AgentRegistry);
  await ctx.plugin(LlmRuntime);
  await ctx.plugin(TestWebServer);
  await ctx.plugin(Object.assign(inner=>{new HostConnectionService(inner,['localhost'],{
    isAuthenticated:request=>request.headers.authorization==='Bearer test-fixture',
    authenticateApi:()=>undefined,
  });},{inject:['webServer']}));
  const adapter=new RecordingAdapter();
  ctx.llm.registerAdapter(['test-provider','deepseek-official'],adapter);
  const config={directory,enabled,profileFile:'parent',prompt:"Predict the user's next message. Return null when unclear.",promptVersion:'dsh-integration-fixture-v1'};
  let controller,pluginFiber;
  if(plugin)pluginFiber=await ctx.plugin(source.predictionPlugin,config);
  else {controller=await source.predictionPlugin.createController(ctx,config);controller.engine.enforceBilling=false;}
  const close=async()=>{
    if(closed)return;closed=true;
    if(controller)await controller.close();
    await ctx.fiber.dispose();
    await rm(directory,{recursive:true,force:true});
  };
  t.after(close);
  return {ctx,directory,routes,adapter,controller,pluginFiber,config,close,strictPlugin:plugin};
}
export async function completedSession(host,{id='thread-1',tools=true,closed=true,simulateSend=false,activateLoop=true,system='stable system prompt'}={}) {
  const {ctx}=host;
  const session=ctx.sessions.create(source.SessionId(id));
 const userMessage=source.createUserMessage({content:[{type:'text',text:'验证前缀缓存'}],source:{kind:'user'}});
 if(simulateSend){session.append('agent/inbox/spliced',{target:'next-turn',start:0,inserted:[userMessage]});session.append('agent/inbox/spliced',{target:'next-turn',start:0,removedCount:1,inserted:[]});}
  session.append('turn/start',{turn:1});
  session.append('step/start',{turn:1,step:1});
  const config={provider:host.strictPlugin?'deepseek-official':'test-provider',model:host.strictPlugin?'deepseek-flash':'test-model',reasoningEffort:'high',maxTokens:200,temperature:0.2,system};
  const declarations=tools?[{name:'read',description:'Read a local file',parameters:{type:'object',properties:{path:{type:'string'}},required:['path']}}]:undefined;
  session.append('request/header',{reason:'initial',header:{config,...declarations?{tools:declarations}:{}}});
  session.append('user/message',userMessage,{surfaceOp:'append'});
  session.append('assistant/message',{turn:1,step:1,stream:[],message:source.createMessage({role:'assistant',source:{kind:'model',provider:config.provider,model:config.model},content:[{type:'text',text:'父线程结果已就绪'}]})},{surfaceOp:'append'});
  session.append('step/end',{turn:1,step:1});
  if(closed)session.append('turn/end',{turn:1,reason:{kind:'completed'}});
  const agent={id:session.id,session,ctx,status:closed?'idle':'running',options:{},inbox:{nextTurn:[],nextStep:[]},cancel(){},whenIdle(){return Promise.resolve();}};
  const detach=ctx.agents.enter(agent);
  if(activateLoop)host.controller?.userSent(session.id,{id:userMessage.id,at:Date.now()});host.controller?.lifecycle.completed(session.id,{normal:closed});
  host.controller?.observe({sessionId:session.id,leaseId:'fixture',sequence:(host.fixtureSequence=(host.fixtureSequence??0)+1),interaction:1,active:true,ready:true});
  return {session,agent,detach,config,declarations};
}
export async function collect(stream){const chunks=[];for await(const x of stream)chunks.push(x);return chunks;}

