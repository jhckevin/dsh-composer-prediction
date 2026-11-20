import { createHash } from 'node:crypto';
import { normalizeUsage } from './billing.mjs';
import {capabilities,boundedJSON,rejectHTTP,providerError,usageProtocol} from './protocol-compat.mjs';

function failure(code, message) { return Object.assign(new Error(message), { code }); }
function abort(signal) { signal?.throwIfAborted(); }
function plain(x) { return x && typeof x === 'object' && !Array.isArray(x); }
function copy(x) { return structuredClone(x); }
const MAX_TEXT_BYTES = 65536;
/** DSH TokenUsage counters are disjoint, including on OpenAI-backed parent routes. */
export function normalizeDSHUsage(raw) {
  if (!raw) return normalizeUsage('deepseek-messages', null);
  return normalizeUsage('deepseek-messages', {
    input_tokens: raw.inputTokens, output_tokens: raw.outputTokens,
    cache_read_input_tokens: raw.cacheReadTokens,
    cache_creation_input_tokens: raw.cacheWriteTokens ?? 0,
    reasoning_tokens: raw.reasoningTokens
  });
}
function promptMessage(prompt) {
  if (typeof prompt !== 'string' || !prompt.trim()) throw failure('INVALID_PROMPT', 'prediction prompt is empty');
  return { role: 'user', content: [{ type: 'text', text: prompt }] };
}
function requestOptions(profile, snapshot, prompt, signal) {
  if (!snapshot?.options || !Array.isArray(snapshot.options.messages)) throw failure('SNAPSHOT_REQUIRED', 'parent request snapshot is unavailable');
  const options = { ...snapshot.options, messages: [...snapshot.options.messages, promptMessage(prompt)], signal,
    sessionId: snapshot.options.sessionId ?? snapshot.sessionId };
  if (profile) {
    options.model = profile.model;
    options.provider = profile.id;
    for (const key of ['reasoningEffort','maxTokens','temperature','stop']) if (profile.request?.[key] !== undefined) options[key] = copy(profile.request[key]);
  }
  return options;
}
function finishKind(reason) {
  const kind = typeof reason === 'string' ? reason : reason?.kind;
  if (kind === 'max-tokens') return 'max_tokens';
  return kind;
}
async function nextWithAbort(iterator, signal) {
  abort(signal);
  if (!signal) return iterator.next();
  let listener;
  const cancelled = new Promise((_,reject) => {
    listener=()=>reject(signal.reason ?? failure('ABORTED','request aborted'));
    signal.addEventListener('abort',listener,{once:true});
  });
  try { return await Promise.race([iterator.next(),cancelled]); }
  finally { signal.removeEventListener('abort',listener); }
}
export async function collectDSHStream(stream, { signal, onUsage, requestMode = 'parent-adapter' } = {}) {
  const blocks = new Map();
  let usage = normalizeDSHUsage(null), toolCalled = false, finishReason, generationObserved=false;
  const count = () => {
    const text = [...blocks].sort(([a],[b]) => a-b).map(([,s]) => s).join('');
    if (Buffer.byteLength(text) > MAX_TEXT_BYTES) throw failure('OUTPUT_LIMIT', 'prediction output exceeds limit');
    return text;
  };
  const iterator=stream[Symbol.asyncIterator]();
  try { while (true) {
    const next=await nextWithAbort(iterator,signal); if(next.done)break; const chunk=next.value;
    if (!plain(chunk) || typeof chunk.type !== 'string') throw failure('MALFORMED_STREAM','invalid DSH chunk');
    if (finishReason !== undefined) throw failure('MALFORMED_STREAM','chunk after terminal finish');
    if(['text-delta','reasoning-delta','block-start','block-end','tool-call-delta'].includes(chunk.type))generationObserved=true;
    if (chunk.type === 'usage') { usage=normalizeDSHUsage(chunk.usage); await onUsage?.(usage); abort(signal); continue; }
    abort(signal);
    if (['text-delta','block-end'].includes(chunk.type) && (!Number.isSafeInteger(chunk.index) || chunk.index < 0)) throw failure('MALFORMED_STREAM','invalid block index');
    if (chunk.type === 'text-delta' && typeof chunk.text !== 'string') throw failure('MALFORMED_STREAM','invalid text delta');
    if (chunk.type === 'text-delta') { blocks.set(chunk.index, (blocks.get(chunk.index) ?? '') + chunk.text); count(); }
    else if (chunk.type === 'block-start' && chunk.blockType === 'tool-call') toolCalled = true;
    else if (chunk.type === 'tool-call-delta') toolCalled = true;
    else if (chunk.type === 'block-end') {
      if (chunk.block?.type === 'text' && typeof chunk.block.text !== 'string') throw failure('MALFORMED_STREAM','invalid completed text');
      if (chunk.block?.type === 'text') { blocks.set(chunk.index, chunk.block.text); count(); }
      if (chunk.block?.type === 'tool-call') toolCalled = true;
    } else if (chunk.type === 'usage') { usage = normalizeDSHUsage(chunk.usage); await onUsage?.(usage); }
    else if (chunk.type === 'finish') {
      if (finishReason !== undefined) throw failure('MALFORMED_STREAM', 'duplicate terminal finish');
      finishReason = finishKind(chunk.reason);
      if (finishReason === 'tool-calls') toolCalled = true;
      if (finishReason === 'aborted') throw failure('ABORTED', 'parent model request aborted');
      if (finishReason === 'error') throw Object.assign(failure(chunk.reason?.failure?.code ?? 'PROVIDER_ERROR', 'parent model request failed'),{status:chunk.reason?.failure?.status,providerRetryAfterMs:chunk.reason?.failure?.providerRetryAfterMs,generationObserved,preGenerationRejection:!generationObserved&&chunk.reason?.failure?.code==='QUOTA'&&chunk.reason?.failure?.status===402});
      if (!['stop','max_tokens','tool-calls'].includes(finishReason)) throw failure('MALFORMED_STREAM', 'unsupported terminal finish');
    }
  } } finally {
    // A provider may leave a demand pending after cancellation; draining must not re-hang teardown.
    try { void Promise.resolve(iterator.return?.()).catch(()=>{}); } catch {}
  }
  abort(signal);
  if (finishReason === undefined) throw failure('STREAM_CLOSED', 'model stream ended before a terminal finish');
  return { text: count(), usage, toolCalled, finishReason, requestMode };
}
function toolDefinition(tool, portable = false) {
  if (!plain(tool) || typeof tool.name !== 'string' || !plain(tool.parameters) || (tool.deferLoading && !portable)) throw failure('UNSUPPORTED_HISTORY', 'Responses translation cannot preserve this tool definition; supply responsesBody');
  return { type: 'function', name: tool.name, description: tool.description ?? '', parameters: copy(tool.parameters) };
}
function textBlocks(content, type) {
  if (!Array.isArray(content) || content.some(b => b?.type !== 'text' || typeof b.text !== 'string')) throw failure('UNSUPPORTED_HISTORY', 'Responses translation requires text-only history; supply native responsesBody for images, reasoning, or provider metadata');
  return content.map(b => ({type, text:b.text}));
}
function translatedInput(options, { portable = false, removed = {} } = {}) {
  const input = [], pending = new Set();
  const count = key => { removed[key]=(removed[key]??0)+1; };
  if (options.system !== undefined) {
    if (typeof options.system !== 'string') throw failure('UNSUPPORTED_HISTORY', 'invalid system prompt');
    input.push({role:'system',content:[{type:'input_text',text:options.system}]});
  }
  for (const original of options.messages) {
    let message=original;
    if(portable){
      if(original?.source?.replayState!==undefined || original?.replayState!==undefined || original?.providerMetadata!==undefined)count('providerReplayMetadata');
      if(!Array.isArray(original?.content))throw failure('UNSUPPORTED_HISTORY','invalid portable message content');
      const content=original.content.filter(block=>{
        if(block?.type==='reasoning'){count('reasoningBlocks');return false;}
        if(block?.type==='tool-addition'||block?.type==='tool-removal'){
          if(original.role!=='developer')throw failure('UNSUPPORTED_HISTORY','tool update outside developer message');
          count('toolUpdateBlocks');return false;
        }
        return true;
      });
      const {source,replayState,providerMetadata,...rest}=original;
      message={...rest,content};
      if(!content.length && ['assistant','developer'].includes(message.role)){count('emptyMessages');continue;}
    }
    if (message?.source?.replayState !== undefined) throw failure('UNSUPPORTED_HISTORY', 'Responses translation cannot preserve opaque model metadata; supply responsesBody');
    if (message?.providerMetadata !== undefined || message?.replayState !== undefined) throw failure('UNSUPPORTED_HISTORY', 'Responses native replay metadata is required');
    if (message?.role === 'tool') {
      if (typeof message.toolCallId !== 'string' || !pending.delete(message.toolCallId)) throw failure('UNSUPPORTED_HISTORY', 'tool result has no matching call');
      if (message.isError && !portable) throw failure('UNSUPPORTED_HISTORY', 'Responses translation cannot preserve tool isError semantics; supply responsesBody');
      let output=textBlocks(message.content,'input_text').map(b=>b.text).join('');
      if(message.isError){count('encodedToolErrors');output=JSON.stringify({is_error:true,content:output});}
      input.push({type:'function_call_output',call_id:message.toolCallId,output});
      continue;
    }
    if (!['system','developer','user','assistant'].includes(message?.role)) throw failure('UNSUPPORTED_HISTORY', 'unsupported Responses message role');
    if (pending.size) throw failure('UNSUPPORTED_HISTORY', 'tool calls require complete immediate results');
    if (message.role === 'assistant') {
      let texts = [];
      const flush = () => { if (texts.length) { input.push({role:'assistant',content:texts}); texts=[]; } };
      if (!Array.isArray(message.content)) throw failure('UNSUPPORTED_HISTORY', 'invalid assistant content');
      for (const block of message.content) {
        if (block?.type === 'text' && typeof block.text === 'string') texts.push({type:'output_text',text:block.text});
        else if (block?.type === 'tool-call') {
          flush();
          if (typeof block.id !== 'string' || !block.id || pending.has(block.id) || typeof block.name !== 'string' || typeof block.arguments !== 'string') throw failure('UNSUPPORTED_HISTORY', 'invalid tool call');
          try { const args=JSON.parse(block.arguments); if (!plain(args)) throw new Error(); } catch { throw failure('UNSUPPORTED_HISTORY', 'invalid historical tool arguments'); }
          pending.add(block.id); input.push({type:'function_call',call_id:block.id,name:block.name,arguments:block.arguments});
        } else throw failure('UNSUPPORTED_HISTORY', 'Responses translation cannot preserve assistant reasoning or non-text blocks; supply responsesBody');
      }
      flush();
    } else input.push({role:message.role,content:textBlocks(message.content,'input_text')});
  }
  if (pending.size) throw failure('UNSUPPORTED_HISTORY', 'history ends with unresolved tools');
  return input;
}
/** Prefer an exact provider request snapshot to preserve wire input, tools and cache affinity.
 * A DSH-only snapshot is conservatively translated; opaque/reasoning/image content is rejected. */
export function buildResponsesRequest(profile, snapshot, prompt) {
  promptMessage(prompt);
  let body, requestMode, migration;
  if (snapshot?.responsesBody !== undefined) {
    if (!plain(snapshot.responsesBody) || !Array.isArray(snapshot.responsesBody.input)) throw failure('UNSUPPORTED_HISTORY', 'native Responses snapshot requires an input item array');
    body = copy(snapshot.responsesBody); requestMode = 'responses-native-replay';
    body.input.push({role:'user',content:[{type:'input_text',text:prompt}]});
  } else {
    const options = snapshot?.options;
    if (!options || !Array.isArray(options.messages)) throw failure('SNAPSHOT_REQUIRED', 'parent request snapshot is unavailable');
    const portable=profile.request?.historyMode==='portable-text';
    if(profile.request?.historyMode!==undefined&&!['portable-text','strict'].includes(profile.request.historyMode))throw failure('INVALID_HISTORY_MODE','unsupported history migration mode');
    if (options.toolHistory?.updates?.length && !portable) throw failure('UNSUPPORTED_HISTORY', 'Responses translation cannot preserve dynamic tool history; supply responsesBody');
    const removed={};
    body = { input: translatedInput(options,{portable,removed}) };
    if (options.tools !== undefined) body.tools = options.tools.map(tool=>toolDefinition(tool,portable));
    if(portable)migration={mode:'portable-text',removed,cacheParity:'cross-backend-no-native-prefix-parity',toolDefinitions:'current-full'};
    if (options.maxTokens !== undefined) body.max_output_tokens = options.maxTokens;
    if (options.temperature !== undefined) body.temperature = options.temperature;
    if (capabilities(profile).reasoning && options.reasoningEffort !== undefined) body.reasoning = { effort: options.reasoningEffort };
    if (options.stop?.length) throw failure('UNSUPPORTED_HISTORY', 'Responses translation cannot preserve stop sequences');
    body.input.push({role:'user',content:[{type:'input_text',text:prompt}]});
    requestMode = portable?'portable-cross-backend':'responses-translated';
  }
  // Explicit profile overrides are conditioning changes and therefore part of profileCacheScope.
  const request = profile.request ?? {};
  for (const key of ['reasoning','output_config','text','temperature','top_p','max_output_tokens','tools','tool_choice','parallel_tool_calls','include','truncation','service_tier']) if (request[key] !== undefined) body[key] = copy(request[key]);
  if (request.maxTokens !== undefined) body.max_output_tokens = request.maxTokens;
  // Parent affinity wins. Never generate a child/random cache key.
  if (body.prompt_cache_key === undefined && (capabilities(profile).cacheKey || profile.cache?.prompt_cache_key!==undefined)) {
    let key = snapshot.promptCacheKey ?? snapshot.options?.prompt_cache_key ?? profile.cache?.prompt_cache_key;
    if(key===undefined){
      const parentId=snapshot.options?.sessionId??snapshot.sessionId;
      if(typeof parentId==='string'&&parentId)key=parentId.length>64?createHash('sha256').update(parentId).digest('hex'):parentId;
    }
    if (key !== undefined) body.prompt_cache_key = key;
  }
  for (const key of ['prompt_cache_retention','prompt_cache_options']) if (capabilities(profile).cacheRetention && body[key] === undefined && profile.cache?.[key] !== undefined) body[key] = copy(profile.cache[key]);
  if (body.tool_choice === 'required' || (plain(body.tool_choice) && body.tool_choice.type !== 'none' && body.tool_choice.type !== 'auto')) throw failure('UNSAFE_TOOL_CHOICE', 'prediction cannot preserve a forced tool choice');
  if (body.conversation) throw failure('UNSAFE_CONVERSATION', 'prediction must not append to a persistent parent Responses conversation; provide stateless input');
  if(!capabilities(profile).tools && body.tools?.length)throw failure('UNSUPPORTED_CAPABILITY','tools unavailable; context was not silently removed');
  if(!capabilities(profile).temperature)delete body.temperature;
  body.model = profile.model; body.stream = capabilities(profile).responseMode!=='json';
  if(capabilities(profile).background||snapshot.responsesBody)body.background = false;
  if(capabilities(profile).storage||body.store!==undefined)body.store = false;
  return {body,requestMode,...migration?{migration}:{}};
}
const PROTECTED_HEADERS=new Set(['authorization','proxy-authorization','content-type','accept','host','cookie','set-cookie','content-length','transfer-encoding','connection','upgrade']);
function headerName(name){
  if(typeof name!=='string'||!name||!/^[A-Za-z0-9!#$%&'*+.^_|~-]+$/.test(name))throw failure('INVALID_HEADER','invalid Responses header name');
  return name.toLowerCase();
}
function headerValue(value){
  if(typeof value!=='string'||/[^\x20-\x7e]/.test(value))throw failure('INVALID_HEADER','Responses header value contains invalid characters');
  return value.trim();
}
function credentialHeader(name){return PROTECTED_HEADERS.has(name)||/api[-_]?key|token|secret|credential|authorization/i.test(name);}
/** Safe static headers are explicit profile configuration. Authentication always comes from
 * the active credential resolver; parent session affinity is never replaced by a child id. */
export function buildResponsesHeaders(profile,snapshot,credential){
  if(typeof credential!=='string'||!credential)throw failure('CREDENTIAL_UNAVAILABLE','Responses credential is unavailable');
  headerValue(credential);
  if(profile.request?.headers!==undefined&&!plain(profile.request.headers))throw failure('INVALID_HEADER','profile headers must be an object');
  if(snapshot.responsesHeaders!==undefined&&!plain(snapshot.responsesHeaders))throw failure('INVALID_HEADER','native Responses headers must be an object');
  const headers={'content-type':'application/json','accept':'text/event-stream','authorization':'Bearer '+credential};
  const affinity=profile.cache?.sessionHeader===undefined?null:headerName(profile.cache.sessionHeader);
  if(affinity&&credentialHeader(affinity))throw failure('INVALID_HEADER','session affinity header conflicts with a protected header');
  for(const [name,value] of Object.entries(snapshot.responsesHeaders??{})){
    const normalized=headerName(name);
    // Never replay another endpoint's authentication or framing headers.
    if(credentialHeader(normalized))continue;
    headers[normalized]=headerValue(value);
  }
  for(const [name,value] of Object.entries(profile.request?.headers??{})){
    const normalized=headerName(name);
    if(credentialHeader(normalized)||normalized===affinity)throw failure('PROTECTED_HEADER','profile headers cannot override authentication, protocol, or session affinity');
    headers[normalized]=headerValue(value);
  }
  if(affinity){
    // A native wire snapshot, if present, is the authoritative parent routing identity.
    if(headers[affinity]===undefined){
      const parentId=snapshot.options?.sessionId??snapshot.sessionId;
      if(typeof parentId!=='string'||!parentId)throw failure('SESSION_AFFINITY_REQUIRED','parent session identity is unavailable');
      headers[affinity]=headerValue(parentId);
    }
  }
  return headers;
}
function isTool(item) { return typeof item?.type === 'string' && (item.type.endsWith('_call') || item.type === 'function_call' || item.type === 'custom_tool_call'); }
function outputText(response) {
  const blocks=[];
  for (const item of response?.output ?? []) for (const part of item.content ?? []) if (part.type === 'output_text' && typeof part.text === 'string') blocks.push(part.text);
  return blocks.join('');
}
async function* sseEvents(body, signal) {
  const reader = body.getReader(), decoder = new TextDecoder(); let buffer='', data=[], bytes=0;
  function line(value) {
    if (value === '') { const payload=data.join('\n');data=[];return payload || undefined; }
    if (value.startsWith('data:')) data.push(value.slice(5).replace(/^ /,''));
  }
  try {
    while (true) {
      abort(signal);
      const next = await reader.read();
      if (next.done) { buffer += decoder.decode(); break; }
      buffer += decoder.decode(next.value,{stream:true}); bytes += next.value.byteLength;
      if (Buffer.byteLength(buffer) > 1048576) throw failure('MALFORMED_STREAM','SSE frame exceeds limit');
      let index;
      while ((index=buffer.indexOf('\n')) >= 0) {
        const current=buffer.slice(0,index).replace(/\r$/,'');buffer=buffer.slice(index+1);
        const payload=line(current);
        if (payload !== undefined) { bytes=0; yield payload; }
      }
      if (bytes > 1048576) throw failure('MALFORMED_STREAM','SSE frame exceeds limit');
    }
    // A final frame can terminate at EOF without a blank separator.
    if (buffer) line(buffer.replace(/\r$/,''));
    const payload=line('');if(payload !== undefined) yield payload;
  } finally { try { await reader.cancel(); } catch {} reader.releaseLock(); }
}
async function responsesTransport(profile,snapshot,prompt,{signal,credential,onUsage,fetchImpl=fetch}) {
  abort(signal);
  if (typeof credential !== 'string' || !credential) throw failure('CREDENTIAL_UNAVAILABLE','Responses credential is unavailable');
  let prepared,headers;try{prepared=buildResponsesRequest(profile,snapshot,prompt);headers=buildResponsesHeaders(profile,snapshot,credential)}catch(e){e.notDispatched=true;throw e}
  const {body,requestMode,migration}=prepared;
  if(capabilities(profile).auth==='x-api-key'){delete headers.authorization;headers['x-api-key']=credential}
  let endpoint=profile.baseURL.replace(/\/+$/,'');if(!endpoint.endsWith('/responses')) endpoint+='/responses';
  const response=await fetchImpl(endpoint,{method:'POST',redirect:'error',signal,headers:{...headers,accept:body.stream?'text/event-stream':'application/json'},body:JSON.stringify(body)});
  if(!response.ok)await rejectHTTP(response,async raw=>{await onUsage?.(normalizeUsage(usageProtocol(profile),raw))});
  if(!response.body) throw failure('EMPTY_RESPONSE','Responses response body is unavailable');
  if(!body.stream){
    const data=await boundedJSON(response);abort(signal);
    const usage=normalizeUsage(usageProtocol(profile),data.usage);await onUsage?.(usage);
    if(data.error)throw providerError(response.status,data,response.headers);
    const toolCalled=(data.output??[]).some(isTool),text=outputText(data);
    if(Buffer.byteLength(text)>MAX_TEXT_BYTES)throw failure('OUTPUT_LIMIT','prediction output exceeds limit');
    if(data.status!=='completed'&&!(data.status==='incomplete'&&data.incomplete_details?.reason==='max_output_tokens'))throw failure('INCOMPLETE_SAMPLE','Responses result not completed');
    return {text,usage,toolCalled,finishReason:data.status==='incomplete'?'max_tokens':toolCalled?'tool-calls':'stop',requestMode,...migration?{migration}:{}};
  }
  let text='',usage=normalizeUsage('responses',null),toolCalled=false,finishReason,terminal=false;
  const saveUsage=async raw=>{if(raw){usage=normalizeUsage(usageProtocol(profile),raw);await onUsage?.(usage);}};
  for await(const payload of sseEvents(response.body,signal)){
    abort(signal);if(payload==='[DONE]')continue;
    let event;try{event=JSON.parse(payload);}catch{throw failure('MALFORMED_STREAM','invalid Responses SSE JSON');}
    if(terminal)throw failure('MALFORMED_STREAM','event after terminal Responses event');
    if(event.type==='response.output_text.delta'){
      if(typeof event.delta!=='string')throw failure('MALFORMED_STREAM','invalid text delta');
      text+=event.delta;if(Buffer.byteLength(text)>MAX_TEXT_BYTES)throw failure('OUTPUT_LIMIT','prediction output exceeds limit');
    }else if(event.type==='response.output_item.added'||event.type==='response.output_item.done'){
      if(isTool(event.item))toolCalled=true;
    }else if(event.type==='response.completed'||event.type==='response.incomplete'||event.type==='response.failed'){
      const result=event.response;await saveUsage(result?.usage);
      if((result?.output??[]).some(isTool))toolCalled=true;
      const finalText=outputText(result);if(finalText)text=finalText;
      if(Buffer.byteLength(text)>MAX_TEXT_BYTES)throw failure('OUTPUT_LIMIT','prediction output exceeds limit');
      terminal=true;
      if(event.type==='response.failed')throw failure('PROVIDER_ERROR','Responses generation failed');
      if(event.type==='response.incomplete'){
        if(result?.incomplete_details?.reason!=='max_output_tokens')throw failure('INCOMPLETE_SAMPLE','Responses generation incomplete');
        finishReason='max_tokens';
      }else finishReason=toolCalled?'tool-calls':'stop';
    }else if(event.type==='error')throw failure('PROVIDER_ERROR','Responses stream failed');
    // response.created/in_progress usage, when sent by gateways, is provisional and never billed as final.
  }
  abort(signal);if(!terminal)throw failure('STREAM_CLOSED','Responses stream ended before terminal response');
  return {text,usage,toolCalled,finishReason,requestMode,...migration?{migration}:{}};
}
/** One physical attempt, no application retry and no tool execution. */
export async function runTransport(profile,snapshot,prompt,options={}) {
  const {signal,credential,onUsage,parentStream,nativeBridge,deepSeekHooks={}}=options;
  abort(signal);
  if(!profile){
    if(typeof parentStream!=='function')throw failure('NO_BACKEND','parent provider is unavailable');
    return collectDSHStream(parentStream(requestOptions(null,snapshot,prompt,signal)),{signal,onUsage,requestMode:'parent-adapter'});
  }
  if(['anthropic-messages','chat-completions'].includes(profile.protocol))return genericTransport(profile,snapshot,prompt,options);
  if(profile.protocol==='responses')return responsesTransport(profile,snapshot,prompt,options);
  if(profile.protocol==='codex-native'){
    if(typeof nativeBridge?.sampleThread!=='function')throw failure('NATIVE_CAPABILITY_REQUIRED','native Codex sampleThread bridge is unavailable');
    const result=await nativeBridge.sampleThread({snapshot,prompt,signal,onUsage});
    abort(signal);
    return {...result,requestMode:'codex-native-bridge'};
  }
  if(profile.protocol!=='deepseek-messages')throw failure('UNSUPPORTED_PROTOCOL','unsupported prediction transport');
  if(typeof credential!=='string'||!credential)throw failure('CREDENTIAL_UNAVAILABLE','DeepSeek credential is unavailable');
  const mod=options.deepSeekModule??await import('../../lib/dsh-native.mjs');
  abort(signal);
  // No process.env is passed: profile endpoint and immutable request configuration own routing.
  const resolved=mod.resolveAdapterOptions({...profile.request,baseURL:profile.baseURL},undefined);
  const hooks=Object.fromEntries(['resolveAttachments','resolveImageAccess','resolveFiles','resolveUserId','onReplayDegrade','onExtensionsOmitted','onExtensionsUnaccepted'].filter(k=>deepSeekHooks[k]!==undefined).map(k=>[k,deepSeekHooks[k]]));
  const adapter=new mod.DeepSeekAdapter({
    providerName:profile.label??profile.id,options:()=>resolved,
    resolveAuth:async()=>({headers:{'x-api-key':credential}}),
    resolveUserId:()=>profile.accountId,
    ...hooks,
    prepareExtensions:deepSeekHooks.prepareExtensions??(async()=>({fields:{},accept:async()=>{}}))
  });
  const original=requestOptions(profile,snapshot,prompt,signal);
  let projected=original;
  if(options.projectDSHOptions){
    if(typeof options.projectDSHOptions!=='function')throw failure('INVALID_PROJECTION_HOOK','DSH projection hook must be a function');
    const {signal:ignoredSignal,...serializable}=original;
    projected=await options.projectDSHOptions({...copy(serializable),signal},resolved);
    abort(signal);
    if(!plain(projected)||!Array.isArray(projected.messages))throw failure('INVALID_PROJECTION','DSH projection returned an invalid request');
    for(const key of Object.keys(original)){
      if(['messages','tools','signal'].includes(key))continue;
      if(JSON.stringify(projected[key])!==JSON.stringify(original[key]))throw failure('INVALID_PROJECTION','DSH projection changed request configuration '+key);
    }
    if(projected.signal!==signal)throw failure('INVALID_PROJECTION','DSH projection changed cancellation signal');
  }else{
    const complex=original.messages.some(m=>m.content?.some(b=>['file','image','tool-addition','tool-removal'].includes(b.type))) ||
      original.toolHistory?.updates?.length || original.tools?.some(t=>t.deferLoading);
    if(complex)throw failure('PROJECTION_REQUIRED','exact DSH file/image/tool-history projection requires the parent runtime hook');
  }
  const result=await collectDSHStream(adapter.stream(projected),{signal,onUsage,requestMode:options.projectDSHOptions?'deepseek-official-adapter-projected':'deepseek-official-adapter-text-only'});
  return {...result,projectionMode:options.projectDSHOptions?'parent-runtime-hook':'not-required-text-only',extensionReplay:deepSeekHooks.prepareExtensions?'parent-hook':'omitted-no-hook'};
}

/** Stateless portable protocols use JSON replies to obtain final usage without stream-option negotiation. */
export function buildGenericRequest(profile,snapshot,prompt){
 promptMessage(prompt);
 const cap=capabilities(profile),options=snapshot.options;
 if(!options||!Array.isArray(options.messages))throw failure('SNAPSHOT_REQUIRED','parent snapshot unavailable');
 const portable=profile.request?.historyMode==='portable-text',removed={};
 if(options.toolHistory?.updates?.length&&!portable)throw failure('UNSUPPORTED_HISTORY','dynamic tools require explicit portable-text migration');
 const input=translatedInput(options,{portable,removed});
 if(!cap.tools&&options.tools?.length)throw failure('UNSUPPORTED_CAPABILITY','tools unsupported; use a compatible route instead of silently removing context');
 const tools=(options.tools??[]).map(t=>toolDefinition(t,portable));
 const request=profile.request??{},isMessages=profile.protocol==='anthropic-messages';
 let body={model:profile.model,stream:false},messages=[];
 if(isMessages){
  const system=[];let started=false;
  const push=(role,content)=>{if(messages.at(-1)?.role===role)messages.at(-1).content.push(...content);else messages.push({role,content})};
  for(const item of input){
   if(item.type==='function_call'){push('assistant',[{type:'tool_use',id:item.call_id,name:item.name,input:JSON.parse(item.arguments)}]);started=true}
   else if(item.type==='function_call_output'){push('user',[{type:'tool_result',tool_use_id:item.call_id,content:item.output}]);started=true}
   else if(['system','developer'].includes(item.role)){
    const text=item.content.map(x=>x.text).join('');
    if(started){if(!portable)throw failure('UNSUPPORTED_HISTORY','mid-conversation instruction cannot become a top-level system prompt');push('user',[{type:'text',text:'[Historical '+item.role+' instruction]\n'+text}]);removed.midConversationInstructions=(removed.midConversationInstructions??0)+1}
    else system.push({type:'text',text});
   }else{push(item.role,item.content.map(x=>({type:'text',text:x.text})));started=true}
  }
  const control=profile.cache?.control;
  if(control!==undefined){
   if(control.type!=='ephemeral'||control.ttl!==undefined&&!['5m','1h'].includes(control.ttl))throw failure('INVALID_CACHE_CONTROL','invalid Messages cache control');
   if(system.length)system.at(-1).cache_control=copy(control);
   // Mark the original parent tail, never the changing prediction instruction.
   const last=messages.at(-1)?.content.at(-1);if(last?.type==='text')last.cache_control=copy(control);
  }
  push('user',[{type:'text',text:prompt}]);
  if(system.length)body.system=system;
  body.messages=messages;body.max_tokens=request.maxTokens??options.maxTokens??1024;
  if(tools.length)body.tools=tools.map(t=>({name:t.name,description:t.description,input_schema:t.parameters}));
  if(options.stop?.length)body.stop_sequences=copy(options.stop);
 }else{
  for(const item of input){
   if(item.type==='function_call'){
    const call={id:item.call_id,type:'function',function:{name:item.name,arguments:item.arguments}};
    if(messages.at(-1)?.role==='assistant') (messages.at(-1).tool_calls??=[]).push(call);
    else messages.push({role:'assistant',content:null,tool_calls:[call]});
   }else if(item.type==='function_call_output')messages.push({role:'tool',tool_call_id:item.call_id,content:item.output});
   else messages.push({role:item.role,content:item.content.map(x=>x.text).join('')});
  }
  messages.push({role:'user',content:prompt});body.messages=messages;
  const field=request.maxTokenField??'max_tokens';
  if(!['max_tokens','max_completion_tokens'].includes(field))throw failure('INVALID_REQUEST','invalid Chat token limit field');
  body[field]=request.maxTokens??options.maxTokens??1024;
  if(tools.length)body.tools=tools.map(({name,description,parameters})=>({type:'function',function:{name,description,parameters}}));
  if(options.stop?.length)body.stop=copy(options.stop);
 }
 if(!Number.isSafeInteger(isMessages?body.max_tokens:body[request.maxTokenField??'max_tokens'])||(isMessages?body.max_tokens:body[request.maxTokenField??'max_tokens'])<1)throw failure('INVALID_REQUEST','invalid output token cap');
 if(cap.temperature&&(request.temperature??options.temperature)!==undefined)body.temperature=request.temperature??options.temperature;
 if(!isMessages&&cap.reasoning&&(request.reasoning_effort??options.reasoningEffort)!==undefined)body.reasoning_effort=request.reasoning_effort??options.reasoningEffort;
 if(isMessages&&request.thinking!==undefined){if(!cap.reasoning)throw failure('UNSUPPORTED_CAPABILITY','thinking requires explicit capability');body.thinking=copy(request.thinking)}
 if(!isMessages&&request.thinking!==undefined){if(!cap.reasoning)throw failure('UNSUPPORTED_CAPABILITY','thinking requires explicit capability');body.thinking=copy(request.thinking)}
 if(isMessages&&request.output_config!==undefined){if(!cap.reasoning)throw failure('UNSUPPORTED_CAPABILITY','output_config requires explicit capability');body.output_config=copy(request.output_config)}
 if(request.tool_choice!==undefined){
  if(!isMessages&&!['none','auto'].includes(request.tool_choice)||isMessages&&!['none','auto'].includes(request.tool_choice?.type))throw failure('UNSAFE_TOOL_CHOICE','prediction cannot force tool execution');
  body.tool_choice=copy(request.tool_choice);
 }
 return {body,requestMode:profile.protocol+'-json',migration:{mode:portable?'portable-text':'strict',removed,cacheParity:'cross-backend-no-native-prefix-parity'}};
}
async function genericTransport(profile,snapshot,prompt,{signal,credential,onUsage,fetchImpl=fetch}){
 abort(signal);const cap=capabilities(profile);let prepared,headers;try{prepared=buildGenericRequest(profile,snapshot,prompt);headers=buildResponsesHeaders(profile,{sessionId:snapshot.sessionId,options:snapshot.options},credential)}catch(e){e.notDispatched=true;throw e}
 const {body,requestMode,migration}=prepared;headers.accept='application/json';
 if(cap.auth==='x-api-key'){delete headers.authorization;headers['x-api-key']=credential}
 if(profile.protocol==='anthropic-messages')headers['anthropic-version']=profile.request?.anthropicVersion??'2023-06-01';
 let endpoint=profile.baseURL.replace(/\/+$/,''),suffix=profile.protocol==='anthropic-messages'?'/messages':'/chat/completions';
 if(!endpoint.endsWith(suffix))endpoint+=suffix;
 const response=await fetchImpl(endpoint,{method:'POST',redirect:'error',signal,headers,body:JSON.stringify(body)});
 if(!response.ok)await rejectHTTP(response,async raw=>{await onUsage?.(normalizeUsage(usageProtocol(profile),raw))});
 const data=await boundedJSON(response);abort(signal);
 const raw=data.usage,usage=normalizeUsage(usageProtocol(profile),raw);await onUsage?.(usage);
 if(data.error)throw providerError(response.status,data,response.headers);
 let text,toolCalled,finishReason;
 if(profile.protocol==='anthropic-messages'){
  if(data.type!=='message'||data.role!=='assistant'||!Array.isArray(data.content))throw failure('MALFORMED_RESPONSE','invalid Messages response');
  text=data.content.filter(x=>x.type==='text').map(x=>{if(typeof x.text!=='string')throw failure('MALFORMED_RESPONSE','invalid Messages text');return x.text}).join('');
  toolCalled=data.content.some(x=>x.type==='tool_use'||x.type==='server_tool_use');
  if(!['end_turn','stop_sequence','max_tokens','tool_use'].includes(data.stop_reason))throw failure('INCOMPLETE_SAMPLE','Messages result is not a completed prediction');
  finishReason=data.stop_reason==='max_tokens'?'max_tokens':toolCalled?'tool-calls':'stop';
 }else{
  if(!Array.isArray(data.choices)||data.choices.length!==1||data.choices[0].message?.role!=='assistant')throw failure('MALFORMED_RESPONSE','invalid Chat response');
  const choice=data.choices[0];text=choice.message.content??'';if(typeof text!=='string')throw failure('MALFORMED_RESPONSE','invalid Chat text');
  toolCalled=!!choice.message.tool_calls?.length||!!choice.message.function_call;
  if(!['stop','length','tool_calls','function_call'].includes(choice.finish_reason))throw failure('INCOMPLETE_SAMPLE','Chat result is not a completed prediction');
  finishReason=choice.finish_reason==='length'?'max_tokens':toolCalled?'tool-calls':'stop';
 }
 if(Buffer.byteLength(text)>MAX_TEXT_BYTES)throw failure('OUTPUT_LIMIT','prediction output exceeds limit');
 return {text,usage,toolCalled,finishReason,requestMode,migration};
}
