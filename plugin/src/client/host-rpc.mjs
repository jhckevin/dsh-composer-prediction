/** Authenticated Connection RPC channel; no key or raw context crosses to the browser. */
export const CHANNEL = '/composer-prediction';
import {POLICY_KEYS,validatePolicy} from '../core/policy.mjs';
import {LIFECYCLE_KEYS,validateLifecycle} from '../core/lifecycle.mjs';
const METHODS = new Set(['state','sample','cancel','configure','profiles','usage','observe','thread','setThread','accept','watch','blacklist','setBlacklist','checkBalance']);
const FIELDS = {
  state:['sessionId'], sample:['sessionId','expectedTurnId','expectedRevision','trigger','leaseId','requestId'],
  watch:['sessionId','afterVersion'],observe:['sessionId','leaseId','sequence','interaction','active','ready','force'],thread:['sessionId'],setThread:['sessionId','enabled'],accept:['sessionId','leaseId','expectedTurnId','expectedRevision','expectedConfigVersion'],
  cancel:['sessionId','leaseId'], configure:['enabled','profileFile','prompt','promptVersion','reloadProfile','instructionText',...POLICY_KEYS,...LIFECYCLE_KEYS],
  blacklist:[],setBlacklist:['scope','id','blocked','label'],
  checkBalance:['sessionId','checkpoint','force'],profiles:[], usage:['sessionId','since','until','profileId']
};
function invalid(message) { const error = new Error(message); error.code='prediction/invalid-request'; throw error; }
export function validatePayload(method,payload) {
  if(!METHODS.has(method)) invalid('Unknown prediction operation');
  if(payload===undefined) payload={};
  if(!payload || typeof payload!=='object' || Array.isArray(payload)) invalid('Expected an object');
  if(JSON.stringify(payload).length>16384) invalid('Request too large');
  for(const key of Object.keys(payload)) if(!FIELDS[method].includes(key)) invalid('Unexpected field');
  if(['state','sample','cancel','observe','thread','setThread','accept','watch','checkBalance'].includes(method) && (typeof payload.sessionId!=='string'||!payload.sessionId||payload.sessionId.length>256)) invalid('Invalid session');
  if(['sample','accept'].includes(method)) {
    if(payload.expectedRevision!==undefined&&(typeof payload.expectedRevision!=='string'||!/^[a-f0-9]{64}$/.test(payload.expectedRevision)))invalid('Invalid source revision');
    if(method==='accept'&&payload.expectedRevision===undefined)invalid('Expected source revision');
    if(method==='accept'&&(!Number.isSafeInteger(payload.expectedConfigVersion)||payload.expectedConfigVersion<0))invalid('Expected configuration version');
  }
  if(method==='watch'&&(!Number.isSafeInteger(payload.afterVersion)||payload.afterVersion<0))invalid('Invalid observation version');
  if(method==='observe'){
    if(!payload.leaseId||!Number.isSafeInteger(payload.sequence)||payload.sequence<1||!Number.isSafeInteger(payload.interaction??0)||(payload.interaction??0)<0||typeof payload.active!=='boolean')invalid('Invalid activity lease');
    for(const key of ['ready','force'])if(payload[key]!==undefined&&typeof payload[key]!=='boolean')invalid('Invalid activity flag');
  }
  if(method==='setBlacklist'&&(!['workspace','thread'].includes(payload.scope)||typeof payload.id!=='string'||!payload.id||payload.id.length>256||/[\x00-\x1f]/.test(payload.id)||typeof payload.blocked!=='boolean'||(payload.label!==undefined&&(typeof payload.label!=='string'||payload.label.length>200||/[\x00-\x1f]/.test(payload.label)))))invalid('Invalid blacklist entry');
  if(method==='checkBalance'&&(typeof payload.checkpoint!=='string'||payload.checkpoint.length>128||typeof payload.force!=='boolean'))invalid('Invalid balance checkpoint');
  if(method==='setThread'&&typeof payload.enabled!=='boolean')invalid('Invalid thread setting');
  if(method==='sample') {
    if(!['live','catch_up','manual_retry'].includes(payload.trigger)) invalid('Invalid trigger');
    if(!['string','number'].includes(typeof payload.expectedTurnId)) invalid('Expected source turn');
  }
  if(payload.requestId!==undefined&&(typeof payload.requestId!=='string'||!payload.requestId||payload.requestId.length>128))invalid('Invalid request id');
  if(payload.leaseId!==undefined && (typeof payload.leaseId!=='string'||payload.leaseId.length>128)) invalid('Invalid lease');
  if(method==='configure') {
    try{validatePolicy(payload);validateLifecycle(payload)}catch{invalid('Invalid prediction policy')}
    if(payload.instructionText!==undefined&&(typeof payload.instructionText!=='string'||new TextEncoder().encode(payload.instructionText).length>8192))invalid('Invalid extra instructions');
    if(payload.enabled!==undefined && typeof payload.enabled!=='boolean') invalid('Invalid enabled setting');
    if(payload.reloadProfile!==undefined && typeof payload.reloadProfile!=='boolean') invalid('Invalid reload setting');
    for(const key of ['profileFile','prompt','promptVersion']) if(payload[key]!==undefined && typeof payload[key]!=='string') invalid('Invalid setting');
    if(payload.prompt!==undefined && new TextEncoder().encode(payload.prompt).length>4000) invalid('Prompt exceeds 4000 bytes');
  }
  return payload;
}
export function createRpcHandler(controller) {
  return async (method,payload,signal,peer) => {
    if(peer?.principal?.kind!=='owner' || peer.signal?.aborted) return {ok:false,error:{code:'prediction/forbidden',message:'Owner access required',details:{}}};
    try {
      const request=validatePayload(method,payload);
      const combined=peer.signal ? AbortSignal.any([signal,peer.signal]) : signal;
      combined.throwIfAborted();
      let value;
      if(['state','observe'].includes(method))await controller.prepareSession?.(request.sessionId);
      if(method==='state') value=await controller.state(request.sessionId);
      else if(method==='checkBalance')value=await controller.checkBalance(request);
      else if(method==='profiles') value=await controller.profiles();
      else if(method==='sample') value=await controller.sample(request,{signal:combined});
      else value=await controller[method](request,{signal:combined});
      return {ok:true,value:value===undefined?null:value};
    } catch(error) {
      return {ok:false,error:{
        code:signal.aborted?'prediction/cancelled':String(error?.code??'prediction/operation-failed'),
        message:error?.code==='prediction/invalid-request'?error.message:'Prediction operation failed',
        details:{}
      }};
    }
  };
}
export function mountRpc(ctx,controller) {
  const connection=ctx.get('connection');
  // rc.1 binds the public rpc getter to its service scope. Supply the caller
  // explicitly through the same canonical registrar; its trust and Peer
  // checks remain intact. Newer runtimes without this registrar use public API.
  if(typeof connection?.register==='function')return connection.register(ctx,CHANNEL,createRpcHandler(controller));
  return ctx.connection.rpc.handle(CHANNEL,createRpcHandler(controller));
}
