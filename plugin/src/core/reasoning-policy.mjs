/** Prediction-only conditioning. No network model probes and no mutation of parent requests. */
export const REASONING_POLICY_VERSION='minimum-v1';
const fail=message=>{throw Object.assign(Error(message),{code:'REASONING_CAPABILITY_REQUIRED',notDispatched:true})};
const rank=['none','minimal','low','medium','high','xhigh','max'];
const minimum=values=>rank.find(x=>values.includes(x));
export function validateReasoningControl(c){
 if(!c||typeof c!=='object'||Array.isArray(c))throw Error('reasoningControl must be an object');
 if(Object.keys(c).some(k=>!['efforts','thinkingModes','minimumBudgetTokens','nonReasoning'].includes(k)))throw Error('unknown reasoningControl key');
 if(c.nonReasoning!==undefined&&typeof c.nonReasoning!=='boolean')throw Error('invalid nonReasoning');
 for(const [k,allowed] of [['efforts',rank],['thinkingModes',['disabled','between_tools','adaptive','enabled']]])if(c[k]!==undefined&&(!Array.isArray(c[k])||!c[k].length||new Set(c[k]).size!==c[k].length||c[k].some(x=>!allowed.includes(x))))throw Error('invalid reasoningControl.'+k);
 if(c.minimumBudgetTokens!==undefined&&(!Number.isSafeInteger(c.minimumBudgetTokens)||c.minimumBudgetTokens<1024))throw Error('invalid minimumBudgetTokens');
 if(c.nonReasoning&&(c.efforts||c.thinkingModes||c.minimumBudgetTokens))throw Error('contradictory reasoningControl');
 if(!c.nonReasoning&&!c.efforts&&!c.thinkingModes)throw Error('empty reasoningControl');
}
function openAIControl(model){
 const m=model.toLowerCase();
 if(/^gpt-6(?:\.1-sol|-astra)(?:-\d{4}-\d{2}-\d{2})?$/.test(m))return {efforts:['low']};
 if(/^gpt-5-pro(?:-\d{4}-\d{2}-\d{2})?$/.test(m))return {efforts:['high']};
 if(/^gpt-5\.2-pro(?:-\d{4}-\d{2}-\d{2})?$/.test(m))return {efforts:['medium']};
 if(/^gpt-5(?:-mini|-nano)?(?:-\d{4}-\d{2}-\d{2})?$/.test(m))return {efforts:['minimal']};
 if(/^gpt-5\.(?:1|5)(?:-\d{4}-\d{2}-\d{2})?$/.test(m))return {efforts:['none']};
 // Exact documented nonreasoning families; unknown aliases must declare their controls.
 if(/^(?:gpt-4o(?:-mini)?|gpt-4\.1(?:-mini|-nano)?)(?:-\d{4}-\d{2}-\d{2})?$/.test(m))return {nonReasoning:true};
 return null;
}
function claudeControl(model){
 const m=model.toLowerCase().replace(/\./g,'-');
 if(/^claude-sonnet-5-5(?:-\d{8})?$/.test(m))return {thinkingModes:['between_tools'],efforts:['low']};
 if(/^claude-(?:haiku-5-5|opus-5)(?:-\d{8})?$/.test(m))return {thinkingModes:['disabled'],efforts:['low']};
 if(/^claude-(?:opus-5-5|(?:fable|mythos)-5(?:-[12])?|mythos-preview)(?:-\d{8})?$/.test(m))return {thinkingModes:['adaptive'],efforts:['low']};
 if(/^claude-(?:sonnet-5|opus-4-[5678]|sonnet-4-[56]|haiku-4-5)(?:-\d{8})?$/.test(m))return {thinkingModes:['disabled']};
 return null;
}
export async function prepareMinimumReasoning({profile,snapshot,resolveModelInfo,signal}){
 signal?.throwIfAborted();
 const s={...snapshot,options:{...snapshot.options}},p=profile?structuredClone(profile):null;
 let decision={policy:REASONING_POLICY_VERSION,mode:'minimum',control:'unavailable'};
 if(!p){
  if(typeof resolveModelInfo!=='function')fail('Native model metadata is required to select minimum prediction reasoning');
  const info=await resolveModelInfo(s.options.provider,s.options.model,signal);signal?.throwIfAborted();
  const efforts=info?.reasoning?.efforts;
  if(Array.isArray(efforts)&&efforts.length){
   const ids=efforts.map(x=>x.id);const selected=ids.find(x=>['off','none','disabled'].includes(x))??ids[0];
   if(typeof selected!=='string'||!selected)fail('Invalid native reasoning metadata');
   s.options.reasoningEffort=selected;decision={...decision,control:'native-adapter',effort:selected,disabled:['off','none','disabled'].includes(selected)};
  }else if(info){
   // The owning adapter advertises no reasoning knob. Sending a fabricated off value is invalid.
   delete s.options.reasoningEffort;decision={...decision,control:'adapter-no-control',disabled:false};
  }else fail('Native model metadata unavailable');
 }else{
  p.request??={};
  const controlUnavailable=p.capabilities?.reasoning===false&&!p.reasoningControl;
  let c=p.reasoningControl;
  if(c)validateReasoningControl(c);
  if(!c&&p.protocol==='deepseek-messages')c={efforts:['none']};
  if(!c&&p.capabilities?.reasoning===false)c={nonReasoning:true};
  if(!c&&p.protocol==='anthropic-messages')c=claudeControl(p.model);
  if(!c&&['responses','chat-completions'].includes(p.protocol)){
   let officialDeepSeek=false;try{officialDeepSeek=new URL(p.baseURL).hostname==='api.deepseek.com'}catch{}
   c=officialDeepSeek?(p.protocol==='chat-completions'?{thinkingModes:['disabled']}:{efforts:['none']}):openAIControl(p.model);
  }
  if(!c)fail('Declare reasoningControl for this model alias before prediction; no paid compatibility probing is performed');
  for(const k of ['reasoningEffort','reasoning','reasoning_effort','thinking','output_config'])delete p.request[k];
  delete s.options.reasoningEffort;
  if(s.responsesBody){s.responsesBody=structuredClone(s.responsesBody);delete s.responsesBody.reasoning;delete s.responsesBody.output_config;}
  p.capabilities={...p.capabilities,reasoning:!c.nonReasoning};
  if(c.nonReasoning){decision={...decision,control:controlUnavailable?'declared-no-control':'non-reasoning-model',disabled:!controlUnavailable};}
  else if(p.protocol==='deepseek-messages'){
   const e=minimum(c.efforts??[]);if(!e)fail('DeepSeek effort metadata required');
   p.request.reasoningEffort=({none:'off',minimal:'low',low:'low',medium:'high',high:'high',xhigh:'high',max:'max'})[e];decision={...decision,control:'deepseek-thinking',effort:p.request.reasoningEffort,disabled:e==='none'};
  }else if(p.protocol==='anthropic-messages'){
   const type=['disabled','between_tools','adaptive','enabled'].find(x=>c.thinkingModes?.includes(x));if(!type)fail('Messages thinking modes required');
   p.request.thinking={type};
   if(type==='enabled'){
    const budget=c.minimumBudgetTokens;if(!budget)fail('Legacy thinking requires a declared minimum budget');
    const cap=p.request.maxTokens??s.options.maxTokens??1024;
    if(budget>=cap)fail('Legacy minimum thinking budget must be less than the output cap; no cap is raised automatically');
    p.request.thinking.budget_tokens=budget;
   }
   if(c.efforts?.some(x=>['none','minimal'].includes(x)))fail('Messages output_config effort cannot be none/minimal; use thinking modes to disable it');
   const effort=c.efforts&&minimum(c.efforts);if(effort)p.request.output_config={effort};
   delete p.request.temperature;delete s.options.temperature;
   decision={...decision,control:'messages-thinking',thinking:type,...effort?{effort}:{},disabled:type==='disabled'};
  }else if(p.protocol==='chat-completions'&&c.thinkingModes?.includes('disabled')){
   p.request.thinking={type:'disabled'};decision={...decision,control:'chat-thinking',thinking:'disabled',disabled:true};
  }else if(['responses','chat-completions'].includes(p.protocol)){
   const effort=minimum(c.efforts??[]);if(!effort)fail('Responses/Chat effort metadata required');
   if(p.protocol==='responses')p.request.reasoning={effort};else p.request.reasoning_effort=effort;
   if(p.protocol==='chat-completions'&&/^gpt-[56]/.test(p.model)&&p.request.maxTokenField===undefined)p.request.maxTokenField='max_completion_tokens';
   // Reasoning models can reject inherited temperature; omit sampling knobs consistently.
   delete p.request.temperature;delete s.options.temperature;if(s.responsesBody)delete s.responsesBody.temperature;
   decision={...decision,control:p.protocol,effort,disabled:effort==='none'};
  }else fail('Native bridge must advertise its reasoning controls');
 }
 s.reasoningDecision=decision;
 return {profile:p,snapshot:s,decision};
}

export async function preparePredictionReasoning({mode='minimum',...args}){
 if(mode==='minimum')return prepareMinimumReasoning(args);
 if(mode!=='configured')throw Object.assign(Error('Invalid prediction reasoning mode'),{code:'INVALID_REASONING_MODE',notDispatched:true});
 args.signal?.throwIfAborted();
 const decision={policy:'configured-v1',mode:'configured',control:'backend-configured',disabled:false};
 return {profile:args.profile,snapshot:{...args.snapshot,reasoningDecision:decision},decision};
}
