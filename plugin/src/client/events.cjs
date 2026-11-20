'use strict';
const SPECIAL=new Set(['thread-blacklisted','workspace-blacklisted','blacklist-unavailable','blacklist-removed','cached-validation-rejected','cache-prefix-loss','prediction-invalidated','context-limit','mapping-tool-pair','history-read-failed','retroactive-read-failed','retroactive-superseded','retroactive-outside-window','retroactive-limit','assistant-not-completed','network-retry','validation-repair','generation-error','stale-response-discarded','external-editing','context-compacted','low-observed-cache-hit','connection-error','retroactive-disabled','retroactive-waiting-normal-reply']);
function eventText(event,t){
 if(!event)return '';
 const code=event.code==='generation-error'&&['QUOTA','BALANCE_PAUSED'].includes(event.data?.reason)?'balance-paused':event.code==='generation-error'&&event.data?.reason==='PRICE_UNAVAILABLE'?'price-unavailable':event.code==='generation-error'&&event.data?.reason==='BILLING_UNRECONCILED'?'billing-unreconciled':event.code;
 const key='event:'+code;let label=t(key);if(!label||label===key)label=t('event:other')+' '+event.code;
 if(event.code==='context-pruned'||event.code==='legacy-compaction-group')label=label.replace('{count}',String(event.data?.count??1));
 const ratio=event.data?.retainedRatio??event.data?.ratio;
 if(typeof ratio==='number')label+=' ('+(ratio*100).toFixed(1)+'%)';
 return label;
}
function specialEvent(state){const event=state.events?.at(-1);return event&&SPECIAL.has(event.code)?event:null}
function displayEvents(events=[]){
 const out=[];for(let i=0;i<events.length;i++){
  const e=events[i];if(!['context-compacted','context-changed'].includes(e.code)){out.push(e);continue;}
  let j=i,count=0;while(j<events.length&&['context-compacted','context-changed'].includes(events[j].code)&&events[j].userEpoch===e.userEpoch&&events[j].sourceRevision===e.sourceRevision){if(events[j].code==='context-compacted')count++;j++;}
  if(count){out.push({...e,id:'legacy:'+e.id,code:'legacy-compaction-group',data:{count}});i=j-1}else out.push(e);
 }return out;
}
module.exports={eventText,specialEvent,displayEvents};
