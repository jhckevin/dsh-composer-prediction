'use strict';
const React=require('react'),h=React.createElement;
const {Switch,Button,Input}=require('@deepseek-ai/dsh-client-ui-primitives');
const {BlacklistControls}=require('./blacklist.cjs');
const {brand}=require('./brand.cjs');
function Row({label,description,children}){return h('div',{className:'cp-setting-row'},h('div',{className:'cp-row-copy'},h('div',{className:'cp-row-title'},label),description?h('p',null,description):null),h('div',{className:'cp-row-control'},children))}
function Section({title,description,children,id}){return h('section',{className:'cp-settings-section',id},h('header',null,h('h3',null,title),description?h('p',null,description):null),h('div',{className:'cp-settings-card'},children))}
function PredictionSettings({usePredictionSettings,useBlacklist,setBlacklist,configure,refresh,t,UsageView,PriceQuote}){
 const reasoningId=React.useId(),reasoningHelpId=reasoningId+'-help';
 const state=usePredictionSettings(x=>x),[busy,setBusy]=React.useState(false),[error,setError]=React.useState(false),[saved,setSaved]=React.useState(false),[draft,setDraft]=React.useState({}),[spec,setSpec]=React.useState(null),[prompt,setPrompt]=React.useState(null),[version,setVersion]=React.useState(null);
 React.useEffect(()=>{void refresh()},[refresh]);
 const commit=async patch=>{setBusy(true);setError(false);setSaved(false);try{await configure(patch);setSaved(true)}catch(e){setError(true);throw e}finally{setBusy(false)}};
 const immediate=p=>{void commit(p).catch(()=>{})},locked=busy||state.busy;
 const value=(k,f)=>draft[k]??state[k]??f;
 const change=(k,v)=>{setSaved(false);setDraft({...draft,[k]:v})};
 const flag=(k,title,desc,fallback)=>h(Row,{label:t(title),description:desc?t(desc):null},h(Switch,{label:t(title),checked:state[k]??fallback,disabled:locked,onChange:v=>immediate({[k]:v})}));
 const number=(k,title,fallback,min,max,desc)=>h(Row,{label:t(title),description:desc?t(desc):null},h(Input,{className:'cp-number',type:'number','aria-label':t(title),value:value(k,fallback),min,max,step:k==='contextQualityCostSlack'||k==='minRetainedCacheRatio'?0.01:1,disabled:locked,onChange:e=>change(k,Number(e.target.value))}));
 const select=(k,title,fallback,options)=>h(Row,{label:t(title)},h('select',{className:'cp-select','aria-label':t(title),value:value(k,fallback),disabled:locked,onChange:e=>change(k,e.target.value)},options.map(([v,label])=>h('option',{key:v,value:v},label))));
 const saveDraft=()=>{void commit(draft).then(()=>setDraft({})).catch(()=>{})};
 const specValue=spec??state.instructionInfo?.text??'',specBytes=new TextEncoder().encode(specValue).length;
 return h('section',{className:'dsh-prediction-settings cp-settings-page','aria-label':t('title')},
 h('header',{className:'cp-page-header'},h('div',{className:'cp-brand'},h('img',{src:brand.icon,width:44,height:44,alt:''}),h('div',null,h('h2',null,t('title')),h('p',null,t('settingsIntro')))),h('div',{className:'cp-release-tag'},brand.version)),
 h('div',{className:'cp-notice'},h('kbd',null,'Tab'),h('span',null,t('completionHelp'))),
 h(Section,{title:t('behaviorTitle'),description:t('behaviorDescription'),id:'prediction-behavior'},
 flag('enabled','enabled','enabledHelp',false),flag('newThreadsEnabled','newThreadsEnabled','newThreadHelp',true),flag('watchdogEnabled','watchdogEnabled','watchdogHelp',true),flag('balanceWatchdogEnabled','balanceWatchdogEnabled','balanceWatchdogHelp',true)),
 h(Section,{title:t('backendTitle'),description:t('backendHelp'),id:'prediction-backend'},
 h(Row,{label:t('backend'),description:t('backendChoiceHelp')},h('div',{className:'cp-control-group'},h('select',{className:'cp-select','aria-label':t('backend'),value:state.profileFile??'parent',disabled:locked,onChange:e=>immediate({profileFile:e.target.value})},h('option',{value:'parent'},t('parent')),(state.profiles??[]).filter(p=>p.id!=='parent').map(p=>h('option',{key:p.filePath??p.file??p.id,value:p.filePath??p.file??p.id},p.label??p.id))),h(Button,{size:'sm',variant:'outline',disabled:locked,onClick:()=>immediate({reloadProfile:true})},t('reload')))),
 h(Row,{label:h('label',{htmlFor:reasoningId},t('reasoningMode')),description:h('span',{id:reasoningHelpId},t('reasoningHelp'))},h('select',{id:reasoningId,name:'reasoningMode',className:'cp-select','aria-describedby':reasoningHelpId,value:value('reasoningMode','minimum'),disabled:locked,onChange:e=>change('reasoningMode',e.target.value)},h('option',{value:'minimum'},t('reasoningMinimum')),h('option',{value:'configured'},t('reasoningConfigured')))),
 state.profileFile==='parent'?h('div',{className:'cp-card-note'},t('parentQuoteHelp')):h(PriceQuote,{quote:state.activePriceQuote,t}),
 h('p',{className:'cp-card-note'},t('compatibilityHelp')),
 h('details',{className:'cp-disclosure'},h('summary',null,t('contextPolicyTitle')),h('div',{className:'cp-disclosure-content'},
 number('contextTargetTokens','contextTargetTokens',32768,1024,1048576,'contextBudgetHelp'),number('contextQualityCostSlack','contextQualityCostSlack',0.05,0,0.25),number('minRetainedCacheRatio','minRetainedCacheRatio',0.5,0.5,1,'prefixGateHelp')))),
 h(Section,{title:t('reliabilityTitle'),description:t('reliabilityHelp'),id:'prediction-limits'},
 select('lengthMode','lengthMode','normal',['short','normal','long','custom'].map(v=>[v,t('length'+v)])),
 number('maxSuggestionTokens','maxTokens',999,1,8192,'hardLimitHelp'),value('lengthMode','normal')==='custom'?number('preferredSuggestionTokens','preferredTokens',160,1,8192):null,
 select('predictionLanguage','language','auto',['auto','zh','zh-Hans','zh-Hant','en','ja','ko','fr','de','es','pt','ru','ar','he'].map(v=>[v,v==='auto'?t('languageAuto'):v])),
 flag('languageCheck','languageCheck','languageGateHelp',true),flag('truncationEnabled','truncate','truncateHelp',false),flag('automaticRetry','automaticRetry','retryPolicy',true),
 h('details',{className:'cp-disclosure'},h('summary',null,t('recoveryOptions')),h('div',{className:'cp-disclosure-content'},
 number('networkRetryLimit','networkRetries',3,0,3),select('repairStrategy','repairStrategy','auto',['auto','draft-only','parent-regenerate','parent-with-draft'].map(v=>[v,t('repairStrategy'+v)])),number('repairMaxOutputTokens','repairOutputCap',4096,32,16384),h('p',{className:'cp-card-note'},t('repairCostNote'))))),
 h(Section,{title:t('existingTitle'),description:t('existingHelp'),id:'prediction-existing'},flag('retroactiveEnabled','retroactiveEnabled',null,true),number('retroactiveHours','retroactiveHours',24,1,87600),number('retroactiveLimit','retroactiveLimit',3,1,100)),
 Object.keys(draft).length?h('div',{className:'cp-save-bar',role:'status'},h('span',null,t('unsavedChanges')),h(Button,{variant:'primary',disabled:locked,onClick:saveDraft},t('saveLimits'))):null,
 h(Section,{title:t('blacklistTitle'),description:t('blacklistDescription'),id:'prediction-blacklist'},h(BlacklistControls,{useBlacklist,setBlacklist,t})),
 h(Section,{title:t('instructionsTitle'),description:t('instructionPriority'),id:'prediction-instructions'},
 h('details',{className:'cp-disclosure'},h('summary',null,t('extraInstructions')),h('div',{className:'cp-disclosure-content'},h('code',null,'instruction_prediction.md'),h('textarea',{className:'cp-textarea','aria-label':t('extraInstructions'),rows:5,value:specValue,disabled:locked,onChange:e=>setSpec(e.target.value)}),h('div',{className:'cp-editor-footer'},h('span',null,specBytes+' / 8192 bytes'),h(Button,{size:'sm',variant:'outline',disabled:locked||specBytes>8192,onClick:()=>immediate({instructionText:specValue})},t('saveInstructions'))))),
 h('details',{className:'cp-disclosure'},h('summary',null,t('prompt')),h('div',{className:'cp-disclosure-content'},h('p',{className:'cp-card-note'},t('promptNote')),h('textarea',{className:'cp-textarea','aria-label':t('prompt'),rows:6,maxLength:4000,value:prompt??state.prompt??'',disabled:locked,onChange:e=>setPrompt(e.target.value)}),h(Row,{label:t('promptVersion')},h(Input,{value:version??state.promptVersion??'',disabled:locked,'aria-label':t('promptVersion'),onChange:e=>setVersion(e.target.value)})),h(Button,{size:'sm',variant:'outline',disabled:locked,onClick:()=>immediate({prompt:prompt??state.prompt??'',promptVersion:version??state.promptVersion??''})},t('save'))))),
 h(Section,{title:t('usageTitle'),description:t('usageHelp'),id:'prediction-usage'},h('div',{className:'cp-section-actions'},h(Button,{size:'sm',variant:'outline',disabled:locked,onClick:()=>{void refresh()}},t('refresh'))),h(UsageView,{usage:state.usage,t})),
 h(Section,{title:t('aboutTitle'),id:'prediction-about'},h('div',{className:'cp-about'},h('strong',null,'Composer Prediction · '+brand.version),h('p',null,t('localPreview')),h('p',null,t('nativeUpdateHelp')),h('p',null,t('privacy')),h('details',null,h('summary',null,t('releaseNotes')),h('ul',null,['releaseUI','releaseBlacklist','releaseValidation','releaseCache'].map(k=>h('li',{key:k},t(k))))))),
 h('div',{className:'cp-write-status','aria-live':'polite'},error||state.error?h('p',{role:'alert'},t('settingsSaveError')):saved?h('p',null,t('settingsSaved')):locked?h('p',null,t('settingsSaving')):null));
}
module.exports={PredictionSettings,Row,Section};
