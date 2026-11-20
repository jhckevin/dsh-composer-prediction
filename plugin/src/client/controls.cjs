const costNumber=(v,upper)=> (upper?'≤ ':'')+v.toFixed(6);
const costShareText=c=>c.predictionShare===null?(c.predictionShareRange?c.predictionShareRange.map(v=>(100*v).toFixed(2)+'%').join(' – '):'—'):(100*c.predictionShare).toFixed(2)+'%';

'use strict';
const {eventText,displayEvents}=require('./events.cjs');
const React=require('react');const {useState,useEffect}=React;const h=React.createElement;
function PolicyControls({state,commit,busy,t}){
 const [draft,setDraft]=useState({}),[spec,setSpec]=useState(null);
 const value=(key,fallback)=>draft[key]??state[key]??fallback;
 const number=(key,label,fallback,min,max)=>h('label',{className:'dsh-prediction-field'},t(label),h('input',{type:'number','aria-label':t(label),min,max,value:value(key,fallback),onChange:e=>setDraft({...draft,[key]:Number(e.target.value)})}));
 const flag=(key,label,fallback)=>h('label',{className:'dsh-prediction-field'},h('input',{type:'checkbox',checked:state[key]??fallback,onChange:e=>commit({[key]:e.target.checked})}),t(label));
 return h(React.Fragment,null,
  h('fieldset',{'data-dsh-prediction-limits':'',disabled:busy},h('legend',null,t('localGates')),
   h('label',{className:'dsh-prediction-field'},t('lengthMode'),h('select',{'aria-label':t('lengthMode'),value:value('lengthMode','normal'),onChange:e=>setDraft({...draft,lengthMode:e.target.value})},['short','normal','long','custom'].map(x=>h('option',{key:x,value:x},t('length'+x))))),
   number('maxSuggestionTokens','maxTokens',999,1,8192),
   value('lengthMode','normal')==='custom'?number('preferredSuggestionTokens','preferredTokens',160,1,8192):null,
   h('label',{className:'dsh-prediction-field'},t('language'),h('select',{'aria-label':t('language'),value:value('predictionLanguage','auto'),onChange:e=>setDraft({...draft,predictionLanguage:e.target.value})},['auto','zh','zh-Hans','zh-Hant','en','ja','ko','fr','de','es','pt','ru','ar','he'].map(x=>h('option',{key:x,value:x},x==='auto'?t('languageAuto'):x)))),
   flag('retroactiveEnabled','retroactiveEnabled',true),
   number('retroactiveHours','retroactiveHours',24,1,87600),
   number('retroactiveLimit','retroactiveLimit',3,1,100),
   number('contextTargetTokens','contextTargetTokens',32768,1024,1048576),
   number('contextQualityCostSlack','contextQualityCostSlack',0.05,0,0.25),
   number('minRetainedCacheRatio','minRetainedCacheRatio',0.5,0.5,1),
   number('networkRetryLimit','networkRetries',3,0,3),
   h('label',{className:'dsh-prediction-field'},t('repairStrategy'),h('select',{'aria-label':t('repairStrategy'),value:value('repairStrategy','auto'),onChange:e=>setDraft({...draft,repairStrategy:e.target.value})},['auto','draft-only','parent-regenerate','parent-with-draft'].map(x=>h('option',{key:x,value:x},t('repairStrategy'+x))))),
   h('p',{className:'dsh-prediction-description'},t('repairCostNote')),
   number('repairMaxOutputTokens','repairOutputCap',4096,32,16384),
   h('button',{type:'button',onClick:()=>commit(draft)},t('saveLimits')),
   flag('truncationEnabled','truncate',false),
   flag('languageCheck','languageCheck',true),
   flag('automaticRetry','automaticRetry',true),
   h('p',{className:'dsh-prediction-description'},t('retryPolicy')),
   h('p',{className:'dsh-prediction-description'},t('visibleTokenNote'))),
  h('details',null,h('summary',null,t('extraInstructions')),
   h('p',{className:'dsh-prediction-description'},t('instructionPriority')),
   h('code',null,'instruction_prediction.md'),
   h('textarea',{'aria-label':t('extraInstructions'),rows:5,value:spec??state.instructionInfo?.text??'',onChange:e=>setSpec(e.target.value),disabled:busy,maxLength:8192}),
   h('button',{type:'button',disabled:busy,onClick:()=>commit({instructionText:spec??state.instructionInfo?.text??''})},t('saveInstructions'))));
}
function RecoveryNotice({usePrediction,useInput,useSession,retry,t}){
 const state=usePrediction(x=>x),input=useInput(x=>x),session=useSession(x=>x);
 if(!state.canRetry||input.draft||input.attachmentIds?.length||session.running)return null;
 return h('div',{'data-dsh-prediction-recovery':'',className:'dsh-prediction-recovery',role:'status'},
  h('span',null,t('predictionHidden')+((state.issues??[]).length?' · '+state.issues.map(code=>t('gate'+code)).join(' / '):state.error?' · '+(['QUOTA','BALANCE_PAUSED'].includes(state.error)?t('balancePausedNotice'):state.error):'')),
  h('button',{type:'button',disabled:state.status==='loading',onMouseDown:e=>e.preventDefault(),onClick:()=>{void retry()}},t('retryPrediction')));
}
function ThreadCostNotice({readCosts,checkBalance,watchProcess,usePrediction,t}){
 useEffect(()=>watchProcess?.(),[watchProcess]);
 const version=usePrediction?usePrediction(x=>x.processVersion??0):0;
 const [value,setValue]=useState(null),[process,setProcess]=useState(null),[failed,setFailed]=useState(false),[refreshId,setRefreshId]=useState(0);
 useEffect(()=>{let active=true;const abort=new AbortController();void readCosts(abort.signal).then(v=>{if(active){setValue(v?.threadAccounting??null);setProcess(v?.process??null);setFailed(false)}}).catch(()=>{if(active)setFailed(true)});return()=>{active=false;abort.abort()}},[readCosts,refreshId,version]);

 const [balanceBusy,setBalanceBusy]=useState(false);
 const currencies=Object.entries(value?.currencies??{}),unpricedReasons={};for(const bag of Object.values(value?.unpricedReasons??{}))for(const [reason,count]of Object.entries(bag??{}))unpricedReasons[reason]=(unpricedReasons[reason]??0)+count;
 return h('section',{'data-dsh-thread-cost':'',className:'dsh-thread-cost-view'},
 h('header',null,h('div',null,h('h2',null,t('threadCost')),h('p',null,t('costViewDescription'))),h('div',{className:'dsh-cost-actions'},h('button',{type:'button',onClick:()=>setRefreshId(x=>x+1)},t('refreshCosts')),checkBalance?h('button',{type:'button',disabled:balanceBusy,onClick:()=>{setBalanceBusy(true);void checkBalance().catch(()=>{}).finally(()=>{setBalanceBusy(false);setRefreshId(x=>x+1)})}},t(balanceBusy?'balanceChecking':'checkBalance')):null)),
 (process?.blacklisted||process?.events?.length)?h('section',{'data-dsh-process-events':'',className:'dsh-process-events'},
 h('strong',null,t('processEvents')),h('p',null,process.phase?t('phase:'+process.phase):eventText(process.blacklisted?{code:process.blacklistReason}:process.events.at(-1),t)),
 h('details',null,h('summary',null,t('eventHistory')),h('p',{className:'dsh-event-order-note'},t('eventOrderNote')),h('ol',null,displayEvents(process.events??[]).map((event,i)=>h('li',{key:event.id??i},eventText(event,t)))))):null,
 process?.balance&&(process.balance.paused||process.balance.checks>0||process.balance.lastResult)?h('section',{className:'dsh-balance-status'},h('strong',null,t(process.balance.paused?'balancePassivePaused':process.balance.lastResult?.available===null?'balanceUnknownTitle':'balancePassiveAvailable')),h('p',null,t('balanceManualAlways')),h('p',null,t('balanceChecks')+': '+process.balance.checks),process.balance.lastResult?.available===null?h('p',null,t('balanceUnknown')):null):null,
 failed?h('p',{role:'status',className:'dsh-cost-note'},t('costLoadFailed')):null,
 !value?h('p',{role:'status',className:'dsh-cost-empty'},t('costLoading')):h(React.Fragment,null,
 currencies.length?h(React.Fragment,null,
 h('div',{className:'dsh-cost-table-wrap'},h('table',null,value.incompleteAttempts?h('caption',null,t('knownSubtotal')):null,
 h('thead',null,h('tr',null,['costCurrency','mainCost','predictionCost','combinedCost','predictionShare'].map(k=>h('th',{key:k,scope:'col'},t(k))))),
 h('tbody',null,currencies.map(([currency,c])=>h('tr',{key:currency},
 h('th',{scope:'row'},currency),h('td',null,costNumber(c.main,c.mainUpperBound)),h('td',null,costNumber(c.prediction,c.predictionUpperBound)),h('td',null,costNumber(c.total,c.totalUpperBound)),h('td',{className:'dsh-cost-share'},costShareText(c))))))),
 h('div',{className:'dsh-cost-cards'},currencies.map(([currency,c])=>h('section',{key:currency,className:'dsh-cost-card','aria-label':currency},
 h('h3',null,currency+(value.incompleteAttempts?' · '+t('knownSubtotal'):'')),h('dl',null,[['mainCost',costNumber(c.main,c.mainUpperBound)],['predictionCost',costNumber(c.prediction,c.predictionUpperBound)],['combinedCost',costNumber(c.total,c.totalUpperBound)],['predictionShare',costShareText(c)]].map(([key,text])=>h('div',{key,className:key==='predictionShare'?'dsh-cost-share':undefined},h('dt',null,t(key)),h('dd',null,text)))))))):h('p',{className:'dsh-cost-empty'},t('noPricedCalls')),
 value.incompleteAttempts?h('p',{className:'dsh-cost-note'},t('unpricedCount')+': '+value.incompleteAttempts+' · '+t('shareUnknown')):null,
 value.incompleteAttempts?h('p',{className:'dsh-cost-note'},Object.entries(unpricedReasons).map(([reason,count])=>t('billingReason:'+reason)+': '+count).join(' · ')):null,
 value.main?.rejectedAttempts?h('details',{className:'dsh-cost-note'},h('summary',null,t('historicalRejections')),h('p',null,t('providerRejected')+': '+value.main.rejectedAttempts)):null,
 Object.values(value.currencies??{}).some(c=>c.predictionShareRange)?h('p',{className:'cp-card-note'},t('shareRange')):null,
 value.incompleteAttempts&&value.sinceInstall?h('section',{className:'dsh-cost-tracked','data-dsh-cost-tracked':''},h('h3',null,t('trackedCoverage')),h('p',null,t('trackedCoverageNote')),Object.entries(value.sinceInstall.currencies??{}).map(([currency,c])=>h('p',{key:currency},h('strong',null,currency+' · '+t('predictionShare')+': '+(costShareText(c))),h('br'),t('mainCost')+': '+costNumber(c.main,c.mainUpperBound)+' · '+t('predictionCost')+': '+costNumber(c.prediction,c.predictionUpperBound)+' · '+t('combinedCost')+': '+costNumber(c.total,c.totalUpperBound))),h('p',null,t('trackedAttempts')+': '+value.sinceInstall.mainAttempts+' / '+value.sinceInstall.predictionAttempts)):null,

 h('details',{className:'dsh-cost-method'},h('summary',null,t('costMethod')),h('p',null,t('shareFormula')),h('p',null,t('shareBasis')),h('p',null,value.historyAvailable?t('shareHistorical'):t('shareSinceInstall')))));
}
function ThreadPredictionMenu({sessionId,useMenuOpenState,threadSource,refreshThread,setThread,t}){
 const source=threadSource(sessionId),state=React.useSyncExternalStore(source.subscribe,source.getSnapshot,source.getSnapshot);
 const [,setOpen]=useMenuOpenState();
 useEffect(()=>{void refreshThread(sessionId)},[sessionId,refreshThread]);
 const enabled=state.threadEnabled&&!state.suspended;
 return h('button',{type:'button',role:'menuitem',disabled:state.busy||state.error||state.blacklisted,'data-dsh-thread-prediction-toggle':'',
  onClick:()=>{setOpen(false);void setThread(sessionId,!enabled)}},t(state.blacklisted?'blacklistEffective':state.suspended?'resumeThreadPrediction':enabled?'disableThreadPrediction':'enableThreadPrediction'));
}
function ComposerPredictionDock(props){return h(RecoveryNotice,props)}
module.exports={PolicyControls,RecoveryNotice,ThreadCostNotice,ComposerPredictionDock,ThreadPredictionMenu};
