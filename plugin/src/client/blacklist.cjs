'use strict';
const React=require('react'),h=React.createElement;
const {Button,Checkbox,MenuItemButton}=require('@deepseek-ai/dsh-client-ui-primitives');
function BlacklistControls({useBlacklist,setBlacklist,t}){
 const state=useBlacklist(x=>x),[error,setError]=React.useState(false);
 const change=p=>{setError(false);void setBlacklist(p).catch(()=>setError(true))};
 return h('fieldset',{'data-dsh-prediction-blacklist':'',disabled:state.busy},h('legend',null,t('blacklistTitle')),h('p',{className:'dsh-prediction-description'},t('blacklistHelp')),
 h('strong',null,t('workspaceBlacklist')),state.workspaces?.length?h('div',null,state.workspaces.map(w=>h(Checkbox,{key:w.id,className:'dsh-prediction-field',label:w.title,checked:w.blocked,onChange:blocked=>change({scope:'workspace',id:w.id,blocked,label:w.title})}))):h('p',null,t('noWorkspaces')),
 (state.blockedWorkspaces??[]).filter(w=>!state.workspaces?.some(row=>row.id===w.id)).map(w=>h('div',{key:w.id},w.label,' ',h(Button,{size:'sm',variant:'outline',onClick:()=>change({scope:'workspace',id:w.id,blocked:false})},t('removeBlacklist')))),
 h('strong',null,t('threadBlacklist')),(state.blockedThreads??[]).length?h('ul',null,state.blockedThreads.map(row=>h('li',{key:row.id},row.label,' ',h(Button,{size:'sm',variant:'outline',onClick:()=>change({scope:'thread',id:row.id,blocked:false})},t('removeBlacklist'))))):h('p',null,t('noBlockedThreads')),
 !state.workspaceLookupAvailable&&state.blockedWorkspaces?.length?h('p',{role:'status'},t('event:blacklist-unavailable')):null,
 error||state.error?h('p',{role:'alert'},t('blacklistError')):null);
}
function ThreadBlacklistMenu({sessionId,displayTitle,useMenuOpenState,useBlacklist,setBlacklist,t}){
 const state=useBlacklist(x=>x),[,close]=useMenuOpenState(),blocked=state.blockedThreads?.some(x=>x.id===sessionId),[failed,setFailed]=React.useState(false);
 return h(MenuItemButton,{disabled:state.busy,'data-dsh-thread-blacklist':'',onSelect:()=>{setFailed(false);void setBlacklist({scope:'thread',id:sessionId,blocked:!blocked,label:displayTitle?.slice(0,200)||sessionId}).then(()=>close(false)).catch(()=>setFailed(true))}},t(failed?'blacklistError':blocked?'removeThreadBlacklist':'addThreadBlacklist'));
}
module.exports={BlacklistControls,ThreadBlacklistMenu};
