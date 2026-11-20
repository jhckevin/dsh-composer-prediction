window.__ModuleLoader__.load({id:"@jhckevin/dsh-composer-prediction",factory:(require)=>{
const definitions={"index.cjs":function(module,exports,require){
'use strict';
const React=require('react');
const {useEffect,useLayoutEffect,useRef,useState}=React;
const {Switch}=require('@deepseek-ai/dsh-client-ui-primitives');
const {PredictionSettings:SettingsPage}=require('./settings.cjs');
const {PolicyControls,RecoveryNotice,ComposerPredictionDock,ThreadCostNotice,ThreadPredictionMenu}=require('./controls.cjs');
const {PredictionClient}=require('./controller.cjs');
const {BlacklistControls,ThreadBlacklistMenu}=require('./blacklist.cjs');
const {showFirstUseNotice}=require('./onboarding.cjs');
const {inputEligible,sessionEligible}=require('./guards.cjs');
const dictionaries=require('./locales.cjs');
const {eventText,specialEvent}=require('./events.cjs');
const h=React.createElement;
const NS='composerPrediction';
function PredictionOverlay({useInput,useSession,usePrediction,inputActions,bind,renderText,t}) {
  const input=useInput(v=>v),session=useSession(v=>v),prediction=usePrediction(v=>v);
  const node=useRef(null);
  useEffect(()=>showFirstUseNotice(node.current?.ownerDocument,t),[]);
  useEffect(()=>node.current?bind(node.current,inputActions):undefined,[bind,inputActions]);
  const visible=inputEligible(input)&&sessionEligible(session)&&typeof prediction.suggestion==='string';
  const event=specialEvent(prediction);
  const pending=inputEligible(input)&&sessionEligible(session)&&(['loading','checking','suspended'].includes(prediction.status)||!!event);
  const text=visible?prediction.suggestion:pending?(event?eventText(event,t):t('status'+prediction.status)):null;
  useLayoutEffect(()=>{if(node.current)renderText?.(node.current,text)});
  return h('div',{ref:node,'data-dsh-prediction':true,'data-dsh-prediction-visible':visible?'':undefined,
    className:'dsh-prediction-overlay','aria-hidden':true},
    text?h('span',{className:'dsh-prediction-text',title:text},text):null);
}
function UsageView({usage,t}) {
  if(!usage) return h('p',{className:'dsh-prediction-description'},t('unknown'));
  const tokens=usage.tokens??{};
  const items=[
    ['attempts',usage.attempts],['cacheHit',usage.cacheHitRatio==null?'—':(usage.cacheHitRatio*100).toFixed(1)+'%'],
    ['inputTokens',tokens.input],['cachedTokens',tokens.cacheRead],['outputTokens',tokens.output],
    ['incomplete',(usage.usageUnknown??0)+(usage.usagePartial??0)],['unpricedCount',usage.unpricedAttempts],['pending',usage.pendingAttempts]
  ];
  const currencies=Object.entries(usage.currencies??{});
  return h('div',{'data-dsh-prediction-usage':'',className:'dsh-prediction-usage'},
    h('dl',null,items.filter(([,value])=>value!==undefined).map(([key,value])=>h('div',{key},
      h('dt',null,t(key)),h('dd',null,typeof value==='number'?value.toLocaleString():value)))),
    currencies.length?h('div',null,currencies.map(([currency,cost])=>h('div',{key:currency,className:'dsh-prediction-cost'},
      h('span',null,t('cost')+' · '+currency),
      h('span',null,Number(cost.exactAmount??cost.amount??0).toFixed(6)),
      cost.upperBoundAmount>0?h('span',null,t('upperBound')+': '+Number(cost.upperBoundAmount).toFixed(6)):null,
      h('small',null,t('saved')+': '+(cost.cacheSavingsUnknownAttempts?'—':Number(cost.cacheReadSavings??0).toFixed(6)))))):null);
}
function PriceQuote({quote,t}) {
  return h('div',{'data-dsh-prediction-quote':'',className:'dsh-prediction-price'},
    h('div',null,t('quoteAtRefresh')),
    !quote||quote.status!=='priced'
      ?h('p',{className:'dsh-prediction-description'},t('quoteUnpriced'))
      :h(React.Fragment,null,
        h('p',{className:'dsh-prediction-description'},[
          quote.versionId,quote.currency,
          quote.period==='peak'?t('quotePeak'):quote.period==='off-peak'?t('quoteOffPeak'):quote.period
        ].filter(Boolean).join(' · ')),
        h('dl',null,['input','cacheRead','cacheWrite','output'].filter(key=>quote.rates?.[key]!==undefined).map(key=>
          h('div',{key},h('dt',null,t('rate'+key)),h('dd',null,String(quote.rates[key])+' '+quote.currency+' / 1M')))),
        quote.certainty!=='exact'||quote.calendarCoverageKnown===false
          ?h('p',{'data-dsh-prediction-quote-upper':'',className:'dsh-prediction-description'},t('quoteUpperBound')):null,
        quote.checkedAt?h('p',{className:'dsh-prediction-description'},t('quoteChecked')+': '+quote.checkedAt):null),
    h('p',{className:'dsh-prediction-description'},t('quoteAuthority')));
}
function PredictionSettings(props){return h(SettingsPage,{...props,UsageView,PriceQuote})}
const CSS=`
.dsh-prediction-first-use{box-sizing:border-box;width:min(420px,calc(100vw - 48px));max-width:420px;padding:24px;border:1px solid var(--dsw-alias-border-l2,#444);border-radius:16px;background:var(--dsw-specific-input-major,#262626);color:var(--dsw-alias-label-primary,#eee);box-shadow:0 16px 64px #0005;font:inherit}
.dsh-prediction-first-use::backdrop{background:#0006}.dsh-prediction-first-use h2{margin:0 0 12px;font-size:18px;line-height:1.4}.dsh-prediction-first-use p{margin:0 0 24px;line-height:1.6;font-size:14px}.dsh-prediction-first-use button{display:block;margin-left:auto;border:1px solid var(--dsw-alias-border-l2,#555);border-radius:8px;padding:8px 18px;background:var(--dsw-specific-input-major,#303030);color:inherit;font:inherit;cursor:pointer}
.dsh-process-events ol{padding-inline-start:28px}.dsh-event-order-note{font-size:12px;color:var(--dsw-alias-label-secondary)}

.dsh-prediction-overlay{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);pointer-events:none;white-space:normal}
.dsh-prediction-text{white-space:pre-wrap;overflow-wrap:anywhere}

[data-dsh-prediction-owner]{visibility:hidden!important}
[data-composer-input][data-dsh-prediction-ghost]:not([data-composer-composing]) p:only-child>br:only-child{display:none}
[data-composer-input][data-dsh-prediction-ghost]:not([data-composer-composing]) p:last-child::after,[data-composer-input][data-dsh-prediction-ghost]:not([data-composer-composing]):empty::after{content:var(--dsh-composer-hint);color:var(--dsw-alias-label-caption);white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}

.dsh-prediction-recovery{display:flex;gap:10px;align-items:center;padding:8px;font-size:12px;color:var(--dsw-alias-label-secondary)}

.cp-settings-page{container:cp-settings / inline-size;width:100%;box-sizing:border-box;overflow-wrap:anywhere;max-width:820px;margin:0 auto;padding:0 0 28px;color:var(--dsw-alias-label-primary);min-width:0}
.cp-page-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 0 24px}.cp-brand{display:flex;align-items:center;gap:14px;min-width:0}.cp-brand img{flex:none;object-fit:contain}.cp-brand h2{font-size:22px;font-weight:600;line-height:1.3;margin:0 0 6px}.cp-brand p{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.6}.cp-release-tag{white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:11px}
.cp-notice{display:flex;gap:12px;align-items:center;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px 14px;font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary);background:var(--dsw-specific-input-major)}.cp-notice kbd{display:inline-flex;align-items:center;justify-content:center;min-width:34px;padding:2px 7px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;font:inherit;color:var(--dsw-alias-label-primary)}
.cp-settings-section{padding-top:28px}.cp-settings-section>header{margin-bottom:12px}.cp-settings-section h3{margin:0;font-size:15px;font-weight:600;line-height:1.5}.cp-settings-section>header p{margin:5px 0 0;font-size:12px;line-height:1.65;color:var(--dsw-alias-label-secondary)}.cp-settings-card{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;overflow:hidden}
.cp-setting-row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:17px 18px;min-width:0}.cp-setting-row+.cp-setting-row{border-top:1px solid var(--dsw-alias-border-l2)}.cp-row-copy{min-width:0;flex:1}.cp-row-title{font-size:13px;line-height:1.6;font-weight:500}.cp-row-copy p{font-size:12px;line-height:1.6;margin:4px 0 0;color:var(--dsw-alias-label-secondary);max-width:510px}.cp-row-control{flex:none;max-width:58%;display:flex;align-items:center;justify-content:flex-end;gap:8px}.cp-control-group{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.cp-row-control .cp-number{width:112px}
.cp-select{box-sizing:border-box;max-width:280px;width:100%;min-width:132px;height:36px;padding:0 30px 0 12px;font:inherit;font-size:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;color:var(--dsw-alias-label-primary);background:var(--dsw-specific-input-major);text-overflow:ellipsis}.cp-select:focus-visible,.cp-textarea:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.cp-card-note{margin:0;padding:14px 18px;font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary);border-top:1px solid var(--dsw-alias-border-l2)}
.cp-disclosure{border-top:1px solid var(--dsw-alias-border-l2)}.cp-disclosure summary{padding:14px 18px;cursor:pointer;line-height:1.6;font-size:12px;color:var(--dsw-alias-label-secondary)}.cp-disclosure-content{padding:0 18px 18px}.cp-disclosure-content>.cp-setting-row{padding-left:0;padding-right:0}.cp-disclosure-content>.cp-card-note{padding-left:0;padding-right:0}.cp-textarea{display:block;box-sizing:border-box;width:100%;resize:vertical;min-height:110px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:12px;background:var(--dsw-specific-input-major);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1.7;margin-top:10px}.cp-editor-footer,.cp-section-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;font-size:11px;color:var(--dsw-alias-label-tertiary)}.cp-section-actions{padding:14px 18px 0;justify-content:flex-end}.cp-save-bar{position:sticky;bottom:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 16px;margin-top:20px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-specific-input-major);font-size:12px;box-shadow:0 4px 22px #0002}
.cp-about{padding:18px;font-size:12px;line-height:1.75}.cp-about p{color:var(--dsw-alias-label-secondary);margin:8px 0}.cp-about summary{cursor:pointer}.cp-about ul{padding-inline-start:20px;color:var(--dsw-alias-label-secondary)}.cp-write-status{min-height:25px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsh-prediction-settings .dsh-prediction-usage{max-height:none;padding:14px 18px 18px;font-size:12px;line-height:1.6}.dsh-prediction-settings .dsh-prediction-usage dl{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.dsh-prediction-settings .dsh-prediction-usage dd{font-size:15px;margin-top:3px;font-variant-numeric:tabular-nums}
.cp-settings-page [data-dsh-prediction-blacklist]{border:0;padding:0;margin:0;min-width:0}.cp-settings-page [data-dsh-prediction-blacklist]>legend{display:none}.cp-settings-page [data-dsh-prediction-blacklist]>p,.cp-settings-page [data-dsh-prediction-blacklist]>strong,.cp-settings-page [data-dsh-prediction-blacklist]>ul{display:block;margin:0;padding:12px 18px;font-size:12px;line-height:1.7}.cp-settings-page [data-dsh-prediction-blacklist]>strong{padding-bottom:4px;color:var(--dsw-alias-label-secondary)}.cp-settings-page [data-dsh-prediction-blacklist] .dsh-prediction-field{margin:0;padding:12px 18px}.cp-settings-page [data-dsh-prediction-blacklist] li{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:8px 0;overflow-wrap:anywhere}.cp-settings-page .dsh-prediction-price{padding:14px 18px}
@media(max-width:650px){.cp-page-header{align-items:flex-start}.cp-release-tag{font-size:10px}.cp-brand h2{font-size:19px}.cp-brand img{width:36px;height:36px}.cp-setting-row{gap:12px;align-items:flex-start;padding:15px 14px}.cp-row-control{max-width:48%}.cp-control-group{flex-direction:column;align-items:stretch}.cp-select{min-width:108px}.cp-row-copy p{font-size:11px}.cp-settings-section{padding-top:24px}}

.dsh-prediction-price dl,.dsh-prediction-usage dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:0}.dsh-prediction-price dt,.dsh-prediction-usage dt{color:var(--dsw-alias-label-secondary)}.dsh-prediction-price dd,.dsh-prediction-usage dd{margin:0;color:var(--dsw-alias-label-primary)}.dsh-prediction-cost{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.dsh-thread-cost-view{container:cp-costs / inline-size;min-width:0;width:100%;overflow-wrap:anywhere;box-sizing:border-box;padding:clamp(12px,3%,24px);max-width:1100px;margin:0 auto;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-primary)}
.dsh-thread-cost-view header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:24px}.dsh-thread-cost-view h2{font-size:18px;font-weight:600;margin:0 0 4px}.dsh-thread-cost-view p{margin:8px 0}.dsh-thread-cost-view header p,.dsh-cost-method,.dsh-cost-note{color:var(--dsw-alias-label-secondary);font-size:12px}
.dsh-thread-cost-view button{font:inherit;color:inherit;background:var(--dsw-specific-input-major);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 12px;cursor:pointer;white-space:nowrap}
.dsh-cost-table-wrap{overflow-x:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:10px}.dsh-thread-cost-view table{border-collapse:collapse;width:100%;text-align:right;font-variant-numeric:tabular-nums}.dsh-thread-cost-view th,.dsh-thread-cost-view td{padding:14px 16px;border-bottom:1px solid var(--dsw-alias-border-l2);white-space:nowrap}.dsh-thread-cost-view thead th{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary)}.dsh-thread-cost-view th:first-child{text-align:left}.dsh-cost-share{font-weight:600}
.dsh-cost-empty{padding:32px 20px;text-align:center;background:var(--dsw-specific-input-major);border-radius:10px;color:var(--dsw-alias-label-secondary)}.dsh-cost-method{margin-top:24px}.dsh-cost-method summary{cursor:pointer}.dsh-cost-note{margin-top:16px!important}
.dsh-cost-actions{display:flex;flex-wrap:wrap;gap:8px}.dsh-balance-status{margin-bottom:16px;padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;overflow-wrap:anywhere}.dsh-cost-tracked{margin-top:20px;padding:16px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-specific-input-major)}.dsh-cost-tracked h3{margin:0 0 8px;font-size:14px}.dsh-cost-tracked p{font-size:12px;overflow-wrap:anywhere}
.dsh-cost-table-wrap caption{text-align:start;padding:12px 16px;color:var(--dsw-alias-label-secondary)}.dsh-cost-cards{display:none}.dsh-cost-card{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:16px;min-width:0}.dsh-cost-card h3{font-size:14px;margin:0 0 12px}.dsh-cost-card dl{margin:0;display:grid;gap:12px}.dsh-cost-card dl>div{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:baseline}.dsh-cost-card dt{color:var(--dsw-alias-label-secondary)}.dsh-cost-card dd{margin:0;text-align:end;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.dsh-cost-card .dsh-cost-share{border-top:1px solid var(--dsw-alias-border-l2);padding-top:12px}.dsh-cost-card .dsh-cost-share dd{color:var(--dsw-alias-label-primary)}
.dsh-thread-cost-view header>div{min-width:0}.dsh-process-events{margin-bottom:20px;min-width:0}.dsh-process-events li{padding-block:3px}.dsh-process-events details{margin-top:12px}.dsh-thread-cost-view summary{cursor:pointer}
@container cp-costs (max-width:660px){.dsh-cost-table-wrap{display:none}.dsh-cost-cards{display:grid;gap:12px}.dsh-thread-cost-view header{flex-wrap:wrap;gap:12px;margin-bottom:24px}.dsh-thread-cost-view header>div{flex:1 1 220px}.dsh-thread-cost-view header button{flex:none}.dsh-process-events ol{padding-inline-start:24px}}
@container cp-settings (max-width:540px){.cp-page-header{flex-wrap:wrap;gap:10px}.cp-brand h2{font-size:19px}.cp-release-tag{margin-inline-start:50px}.cp-setting-row{padding:15px 14px;gap:12px}.cp-setting-row:has(.cp-select,.cp-number,.cp-control-group){flex-direction:column;align-items:stretch}.cp-setting-row:has(.cp-select,.cp-number,.cp-control-group)>.cp-row-control{max-width:100%;width:100%;justify-content:flex-start}.cp-control-group{flex-direction:row;flex-wrap:wrap;justify-content:flex-start}.cp-select{max-width:100%;min-width:0}.cp-save-bar,.cp-editor-footer{flex-wrap:wrap}.dsh-prediction-settings .dsh-prediction-usage dl{grid-template-columns:repeat(2,minmax(0,1fr))}.cp-settings-page [data-dsh-prediction-blacklist] li{flex-wrap:wrap}.cp-settings-page .dsh-prediction-field{flex-wrap:wrap;min-width:0}.cp-notice{align-items:flex-start}.cp-row-copy p{font-size:12px}}

@media(max-width:480px){.dsh-prediction-settings-heading{gap:12px}}
`;
const inject=['slots','locale','connection','sessions','conversation'];
function apply(ctx) {
  const client=new PredictionClient({rpc:ctx.connection.rpc,connection:ctx.connection,sessions:ctx.sessions,conversation:ctx.conversation,document});
  ctx.effect(()=>ctx.locale.register(NS,dictionaries),'composer-prediction: dictionaries');
  ctx.effect(()=>{
    const style=document.createElement('style');style.dataset.dshPredictionStyle='';style.textContent=CSS;document.head.append(style);
    return()=>style.remove();
  },'composer-prediction: styles');
  ctx.effect(()=>()=>client.close(),'composer-prediction: client lifetime');
  ctx.slots.inject('conversation.input.overlay',()=>ctx.slots.register({
    name:'conversation.input.overlay',id:'composer-prediction',locale:NS,
    inject:sessionId=>({
      hooks:{prediction:client.sourceFor(sessionId)},
      bind:(node,actions)=>client.bind(sessionId,node,actions),renderText:(node,text)=>client.renderDecoration(sessionId,node,text)
    })
  },PredictionOverlay));
  ctx.slots.inject('conversation.composer.dock',()=>ctx.slots.register({
    name:'conversation.composer.dock',id:'composer-prediction-recovery',locale:NS,
    inject:sessionId=>({hooks:{prediction:client.sourceFor(sessionId)},retry:()=>client.retry(sessionId)})
  },ComposerPredictionDock));
  ctx.slots.inject('conversation.view',()=>ctx.slots.register({
    name:'conversation.view',id:'prediction-costs',order:20,locale:NS,label:()=>ctx.locale.bind(NS)('costTabTitle'),
    inject:sessionId=>({hooks:{prediction:client.sourceFor(sessionId)},watchProcess:()=>client.watchProcess(sessionId),readCosts:signal=>client.call('usage',{sessionId},signal),checkBalance:()=>client.call('checkBalance',{sessionId,checkpoint:'costs:'+globalThis.crypto.randomUUID(),force:true})})
  },ThreadCostNotice));
  ctx.slots.inject('sidebar.workspaces.session.menu.item',()=>ctx.slots.register({
    name:'sidebar.workspaces.session.menu.item',id:'composer-prediction-toggle',order:450,locale:NS,
    inject:()=>({threadSource:id=>client.threadSource(id),refreshThread:id=>client.refreshThread(id),setThread:(id,enabled)=>client.setThread(id,enabled)})
  },ThreadPredictionMenu));
  ctx.slots.inject('sidebar.workspaces.session.menu.item',()=>ctx.slots.register({
    name:'sidebar.workspaces.session.menu.item',id:'composer-prediction-blacklist',order:451,locale:NS,
    inject:()=>({hooks:{blacklist:client.blacklist},setBlacklist:p=>client.setBlacklist(p)})
  },ThreadBlacklistMenu));
  void client.refreshBlacklist();
  ctx.inject?.(['contextMenus'],()=>ctx.effect(()=>ctx.contextMenus.register({
    id:'composer-prediction.workspace-blacklist',target:'workspace',order:250,
    resolve:({workspaceId,displayTitle})=>{const state=client.blacklist.getSnapshot(),blocked=state.blockedWorkspaces?.some(x=>x.id===workspaceId);return [{id:'prediction-blacklist',label:ctx.locale.bind(NS)(blocked?'removeWorkspaceBlacklist':'addWorkspaceBlacklist'),disabled:state.busy||!!state.error,run:()=>client.setBlacklist({scope:'workspace',id:workspaceId,blocked:!blocked,label:displayTitle.slice(0,200)})}]}
  }),'composer-prediction: workspace blacklist menu'));
  ctx.slots.inject('settings.section.icon',()=>ctx.slots.register({name:'settings.section.icon',id:'composer-prediction'},()=>h('img',{src:require('./brand.cjs').brand.icon,width:18,height:18,alt:''})));
  ctx.slots.inject('settings.section',()=>{let off=()=>{};const register=()=>{off();off=ctx.slots.register({
    name:'settings.section',id:'composer-prediction',order:60,locale:NS,label:ctx.locale.bind(NS)('title'),
    inject:()=>({hooks:{predictionSettings:client.settings,blacklist:client.blacklist},setBlacklist:p=>client.setBlacklist(p),
      configure:patch=>client.configure(patch),refresh:()=>client.refreshSettings()})
  },PredictionSettings)};register();const unlisten=ctx.locale.subscribe?.(register)??(()=>{});return()=>{unlisten();off()}});
}
module.exports={inject,apply};

},
"controller.cjs":function(module,exports,require){
'use strict';
const {POLICY_FIELDS}=require('./policy-fields.cjs');
const {inputEligible,sessionEligible,acceptanceKey,editorEligible}=require('./guards.cjs');
const {paint,restore,ghostAvailable}=require('./placeholder.cjs');
const {specialEvent}=require('./events.cjs');
const LIFECYCLE_FIELDS=['newThreadsEnabled','watchdogEnabled','balanceWatchdogEnabled','minRetainedCacheRatio','contextTargetTokens','contextQualityCostSlack','retroactiveEnabled','retroactiveHours','retroactiveLimit'];
function observable(value){const listeners=new Set();return {getSnapshot:()=>value,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},publish(next){value=next;for(const fn of [...listeners])fn()}}}
class PredictionClient{
 constructor({rpc,sessions,conversation,connection,document}){
  Object.assign(this,{rpc,sessions,conversation,connection,document});this.entries=new Map();this.threads=new Map();this.closed=false;this.activeEntry=null;this.interaction=0;this.processWatches=new Set();
  this.blacklist=observable({workspaces:[],blockedWorkspaces:[],blockedThreads:[],workspaceLookupAvailable:true,busy:false});
  this.settings=observable({enabled:false,profileFile:'parent',profiles:[],usage:null,error:null,busy:false});
  this.disposeConnection=connection.generation.subscribe(()=>this.invalidate('connection'));
  this.window=document.defaultView;
  this.foregroundEpoch=0;this.windowActive=false;
  this.onForeground=()=>{const changed=!this.windowActive;this.windowActive=true;if(changed)this.foregroundEpoch++;for(const entry of this.entries.values())if(entry.mounts.size){this.update(entry,'catch_up',{interacted:true});if(changed)void this.call('checkBalance',{sessionId:entry.sessionId,checkpoint:entry.leaseId+':foreground:'+this.foregroundEpoch,force:false}).catch(()=>{})}};
  this.onWindowBlur=()=>{this.windowActive=false};this.window?.addEventListener('blur',this.onWindowBlur);
  this.onBackground=()=>{this.windowActive=false;for(const entry of this.entries.values())this.deactivate(entry,'background')};
  this.onVisibility=()=>document.visibilityState==='hidden'?this.onBackground():this.onForeground();
  document.addEventListener('visibilitychange',this.onVisibility);this.window?.addEventListener('focus',this.onForeground);
 }
 async call(method,payload={},signal){const r=await this.rpc.call('/composer-prediction',method,payload,signal);if(!r.ok){const e=Error(r.error.message);e.code=r.error.code;throw e}return r.value}
 entry(id){
  let e=this.entries.get(id);if(!e){e={sessionId:id,source:observable({suggestion:null,status:'idle',error:null}),mounts:new Set(),generation:0,lastAttempt:null,inflight:null,leaseId:globalThis.crypto.randomUUID(),sequence:0,wasRunning:false};this.entries.set(id,e);}
  return e;
 }
 sourceFor(id){return this.entry(id).source}
 set(e,patch){e.source.publish({...e.source.getSnapshot(),...patch});for(const m of e.mounts)paint(m,this.canUse(e,m)&&typeof e.source.getSnapshot().suggestion==='string',e.source.getSnapshot().suggestion)}
 foreground(m){
  return !this.closed&&this.document.visibilityState!=='hidden'&&m.node.isConnected!==false&&m.editor?.isConnected!==false&&
   !m.card.closest?.('[hidden],[aria-hidden="true"]')&&(!m.card.getClientRects||m.card.getClientRects().length>0);
 }
 canUse(e,m){return ghostAvailable(m)&&e.hostState?.enabled!==false&&e.hostState?.threadEnabled!==false&&this.activeEntry===e&&e.activeMount===m&&this.foreground(m)&&!m.composing&&inputEligible(m.input.state.getSnapshot())&&sessionEligible(m.binding.session.getSnapshot())&&editorEligible(m.editor,m.card)}
 ready(e){return [...e.mounts].some(m=>this.canUse(e,m))}
 hide(e,reason){e.generation++;e.inflight?.abort(reason);e.inflight=null;e.accepting=false;this.set(e,{suggestion:null,status:'idle',error:null,canRetry:false});void this.call('cancel',{sessionId:e.sessionId,leaseId:e.leaseId}).catch(()=>{})}
 cancel(e,reason){this.hide(e,reason)}
 async observe(e,{active=true,force=false,signal}={}){
  const ready=this.ready(e);
  const value=await this.call('observe',{sessionId:e.sessionId,leaseId:e.leaseId,sequence:++e.sequence,interaction:e.interaction??0,active,ready,force},signal);
  if(value?.observation?.accepted===false)return null;
  return value?{...value,observedReady:ready}:value;
 }
 deactivate(e,reason){
  e.watchAbort?.abort();e.watchAbort=null;this.hide(e,reason);
  if(this.activeEntry===e)this.activeEntry=null;
  void this.observe(e,{active:false}).catch(()=>{});
 }
 update(e,trigger='catch_up',{interacted=false}={}){
  if(this.closed||!e.mounts.size)return;
  const visibleMounts=[...e.mounts].filter(m=>this.foreground(m)),visible=visibleMounts.length>0;
  if(!visibleMounts.includes(e.activeMount))e.activeMount=visibleMounts[0];
  if(!visible){if(this.activeEntry===e)this.deactivate(e,'inactive');return;}
  if(this.activeEntry!==e){
   if(this.activeEntry)this.deactivate(this.activeEntry,'session-switch');
   this.activeEntry=e;e.interaction=++this.interaction;interacted=true;
  }
  if(interacted)e.interaction=++this.interaction;
  const running=[...e.mounts].some(m=>m.binding.session.getSnapshot().running);
  const live=e.wasRunning&&!running;e.wasRunning=running;
  if(live)e.pendingTrigger='live';
  if(!this.ready(e))this.hide(e,'composer-unavailable');
  void this.refresh(e,live?'live':trigger);
  this.startWatch(e);
 }
 startWatch(e){
  if(e.watchUnsupported||e.watchAbort||this.closed||this.activeEntry!==e||!e.mounts.size)return;
  const abort=new AbortController();e.watchAbort=abort;
  void (async()=>{try{while(!abort.signal.aborted&&this.activeEntry===e&&e.mounts.size){
   const value=await this.call('watch',{sessionId:e.sessionId,afterVersion:e.version??0},abort.signal);
   if(abort.signal.aborted||this.activeEntry!==e)break;
   if(!value||typeof value.version!=='number'){e.watchUnsupported=true;break;}
   e.version=value.version;
   const structural=['user-submitted','assistant-running','context-changed','context-updated','prediction-invalidated','context-compacted','external-editing','cache-prefix-loss','thread-disabled','thread-blacklisted','workspace-blacklisted','blacklist-unavailable','blacklist-removed','configuration-changed'].includes(value.event?.code);
   if(structural)this.hide(e,'source-event');
   if(e.inflight)e.pendingTrigger='catch_up';else void this.refresh(e,'catch_up');
  }}catch(error){if(!abort.signal.aborted)this.set(e,{notice:'connection-error'})}finally{if(e.watchAbort===abort)e.watchAbort=null}})();
 }
 watchProcess(id){
  const e=this.entry(id);let abort,closed=false;
  const start=()=>{abort?.abort();if(closed||this.closed)return;abort=new AbortController();const signal=abort.signal;
   void (async()=>{let version=0;try{while(!signal.aborted){const value=await this.call('watch',{sessionId:id,afterVersion:version},signal);
    if(signal.aborted||!value||typeof value.version!=='number')break;version=value.version;
    const events=[...(e.source.getSnapshot().events??[])];if(value.event&&!events.some(x=>x.id===value.event.id))events.push(value.event);
    this.set(e,{events:events.slice(-32),processVersion:version});
   }}catch{if(!signal.aborted)this.set(e,{notice:'connection-error'})}})();
  };
  const off=this.connection.generation.subscribe(start),dispose=()=>{closed=true;abort?.abort();off();this.processWatches.delete(dispose)};
  this.processWatches.add(dispose);start();return dispose;
 }
 renderDecoration(id,node,text){const e=this.entries.get(id);if(!e)return;const m=[...e.mounts].find(m=>m.node===node);if(m)paint(m,!!text&&this.canUse(e,m),text)}
 bind(sessionId,node,inputActions){
  const e=this.entry(sessionId),card=node.closest('[data-composer-card]'),binding=this.sessions.binding(sessionId);
  if(!card||!binding){this.set(e,{status:'unsupported',error:'editor-contract'});return()=>{}}
  const input=this.conversation.input.for(binding.ctx);
  const m={node,card,binding,input,inputActions,owner:e.leaseId+':'+globalThis.crypto.randomUUID(),editor:null};e.mounts.add(m);e.activeMount=m;
  const update=()=>{m.editor=card.querySelector('[data-composer-input],[contenteditable][role="textbox"],[contenteditable="true"]');this.update(e)};
  const interaction=()=>{e.activeMount=m;e.interaction=++this.interaction;update()};
  const keydown=event=>{
   if(event.target!==m.editor||!acceptanceKey(event)||!this.canUse(e,m))return;
   const suggestion=e.source.getSnapshot().suggestion;
   if(suggestion){event.preventDefault();event.stopPropagation();void this.accept(e,m,suggestion);return;}
   if(event.key==='Tab'&&e.hostState?.enabled!==false&&e.hostState?.threadEnabled!==false&&!e.hostState?.suspended){
    event.preventDefault();event.stopPropagation();
    if(e.source.getSnapshot().canRetry)void this.retry(sessionId);else void this.refresh(e,'catch_up',{force:true});
   }
  };
  const composition=()=>{m.composing=true;this.hide(e,'composition')};
  const compositionEnd=()=>{m.composing=false;update()};
  const beforeinput=()=>this.hide(e,'typing');
  const offInput=input.state.subscribe(update),offSession=binding.session.subscribe(update);
  card.addEventListener('keydown',keydown,true);card.addEventListener('pointerdown',interaction,true);card.addEventListener('focusin',interaction);
  card.addEventListener('compositionstart',composition,true);card.addEventListener('compositionend',compositionEnd,true);card.addEventListener('beforeinput',beforeinput,true);
  const Observer=this.window?.MutationObserver;
  const observer=Observer?new Observer(records=>{if(records.every(r=>r.attributeName==='style')&&(!m.ghost||m.editor.style.getPropertyValue('--dsh-composer-hint')===m.ghost.appliedValue))return;update()}):null;
  observer?.observe(card,{subtree:true,childList:true,attributes:true,attributeFilter:['contenteditable','aria-disabled','aria-expanded','data-composer-composing','style']});
  const Resize=this.window?.ResizeObserver;const resize=Resize?new Resize(()=>this.set(e,{})):null;resize?.observe(card);
  update();
  return()=>{
   offInput();offSession();observer?.disconnect();resize?.disconnect();restore(m);
   card.removeEventListener('keydown',keydown,true);card.removeEventListener('pointerdown',interaction,true);card.removeEventListener('focusin',interaction);
   card.removeEventListener('compositionstart',composition,true);card.removeEventListener('compositionend',compositionEnd,true);card.removeEventListener('beforeinput',beforeinput,true);
   e.mounts.delete(m);if(e.activeMount===m)e.activeMount=[...e.mounts][0];if(!e.mounts.size){this.deactivate(e,'unmounted');e.lastAttempt=null;}
   for(const [id,old] of this.entries)if(this.entries.size>64&&!old.mounts.size)this.entries.delete(id);
  };
 }
 async refresh(e,trigger,{force=false}={}){
  if(this.closed||e.inflight||!e.mounts.size||this.activeEntry!==e)return;
  const generation=e.generation,abort=new AbortController();e.inflight=abort;
  try{
   const state=await this.observe(e,{force,signal:abort.signal});
   if(!state||generation!==e.generation||abort.signal.aborted||this.activeEntry!==e)return;
   if(state.observedReady!==this.ready(e)){e.pendingTrigger=e.pendingTrigger??trigger;return;}
   e.hostState=state;e.version=state.version??e.version??0;
   const eventFields={events:state.events??[],processVersion:state.version??0,notice:state.events?.at(-1)?.code??null};
   this.settings.publish({...this.settings.getSnapshot(),enabled:state.enabled,...state.profileFile===undefined?{}:{profileFile:state.profileFile}});
   const identity=JSON.stringify([state.expectedTurnId,state.revision,state.configVersion]);
   const displayed=e.source.getSnapshot().identity;
   if(displayed&&displayed!==identity)this.set(e,{suggestion:null,status:'idle',error:null,canRetry:false,identity:null});
   if(!state.enabled||state.blacklisted||state.threadEnabled===false||state.suspended||!state.eligible||!this.ready(e)){
    this.set(e,{...eventFields,suggestion:null,status:state.suspended?'suspended':'idle',error:state.suspended??null,canRetry:false});return;
   }
   const expectedTurnId=state.expectedTurnId??state.latestTurnId,expectedRevision=state.revision;
   if(expectedTurnId==null||expectedRevision==null)return;
   if(!force&&(state.consumedRevision===expectedRevision||e.consumedIdentity===identity)){this.set(e,{...eventFields});return;}
   if(state.cachedResult&&!(trigger==='manual_retry'&&state.cachedResult.canRetry)){const result=state.cachedResult;const completed={...eventFields,status:result.canRetry?'error':result.abstained?'abstained':'idle',canRetry:!!result.canRetry,error:result.reason??null,issues:result.issues??[],sourceTurnId:expectedTurnId,sourceRevision:expectedRevision,sourceConfigVersion:state.configVersion,identity,suggestion:typeof result.suggestion==='string'?result.suggestion:null};e.cached=completed;e.lastAttempt=identity;this.set(e,completed);return;}
   if(state.canGenerate===false&&trigger!=='manual_retry'){this.set(e,{...eventFields,status:'idle',suggestion:null,canRetry:false});return;}
   if(!force&&e.lastAttempt===identity){if(e.cached?.identity===identity)this.set(e,{...e.cached,...eventFields});return;}
   e.lastAttempt=identity;this.set(e,{status:'loading',suggestion:null,error:null,canRetry:false,identity});
   const result=await this.call('sample',{sessionId:e.sessionId,expectedTurnId,expectedRevision,trigger,leaseId:e.leaseId,...trigger==='manual_retry'?{requestId:e.manualRequestId}:{}},abort.signal);
   if(generation!==e.generation||abort.signal.aborted||!this.ready(e)||this.activeEntry!==e)return;
   // A successful RPC still cannot move a suggestion across source generations.
   if(result?.revision!==undefined&&result.revision!==expectedRevision){this.set(e,{suggestion:null,status:'idle',identity:null});return;}
   const suggestion=typeof result==='string'?result:result?.suggestion;
   const completed={...eventFields,status:result?.canRetry?'error':'idle',canRetry:!!result?.canRetry,error:result?.canRetry?result.reason:null,recovery:result?.recovery,issues:result?.issues??[],
    sourceTurnId:expectedTurnId,sourceRevision:expectedRevision,sourceConfigVersion:state.configVersion,identity,suggestion:typeof suggestion==='string'&&suggestion.trim()?suggestion.trim():null};e.cached=completed;this.set(e,completed);
  }catch(error){if(generation===e.generation&&!abort.signal.aborted)this.set(e,{status:'error',suggestion:null,canRetry:true,error:error.code??'request'})}
  finally{if(e.inflight===abort){e.inflight=null;if(e.source.getSnapshot().status==='loading')this.set(e,{status:'idle'});const next=e.pendingTrigger;e.pendingTrigger=null;if(next&&this.activeEntry===e&&e.mounts.size)void this.refresh(e,next);}}
 }
 async accept(e,m,suggestion){
  if(e.accepting||!this.canUse(e,m))return false;
  const source=e.source.getSnapshot(),span=m.inputActions.captureInsertion(),generation=e.generation;
  if(span.start!==0||span.end!==0||span.draftRev!==m.input.state.getSnapshot().draftRev)return false;
  e.accepting=true;this.set(e,{suggestion:null,status:'checking'});
  try{
   const checked=await this.call('accept',{sessionId:e.sessionId,expectedTurnId:source.sourceTurnId,expectedRevision:source.sourceRevision,expectedConfigVersion:source.sourceConfigVersion,leaseId:e.leaseId});
   if(!checked?.valid||generation!==e.generation||!this.canUse(e,m)||span.draftRev!==m.input.state.getSnapshot().draftRev){e.cached=null;this.set(e,{suggestion:null,status:'idle',identity:null});return false;}
   if(!m.inputActions.insertText(suggestion,span))return false;
   e.consumedIdentity=source.identity;m.inputActions.persistDraft();this.hide(e,'accepted');return true;
  }catch{this.set(e,{suggestion:null,status:'idle',error:'source-validation'});return false}
  finally{e.accepting=false;}
 }
 async retry(id){const e=this.entries.get(id);if(!e?.source.getSnapshot().canRetry||e.inflight||!this.ready(e))return;e.manualRequestId=globalThis.crypto.randomUUID();return this.refresh(e,'manual_retry',{force:true})}
 async insert(id){const e=this.entries.get(id),suggestion=e?.source.getSnapshot().suggestion;if(!suggestion)return false;const m=[...e.mounts].find(m=>this.canUse(e,m));return m?this.accept(e,m,suggestion):false}
 async refreshBlacklist(){this.blacklist.publish({...this.blacklist.getSnapshot(),busy:true});try{this.blacklist.publish({...await this.call('blacklist'),busy:false,error:null})}catch{this.blacklist.publish({...this.blacklist.getSnapshot(),busy:false,error:true})}}
 async setBlacklist(payload){this.blacklist.publish({...this.blacklist.getSnapshot(),busy:true});try{const value=await this.call('setBlacklist',payload);this.blacklist.publish({...value,busy:false,error:null});for(const id of value.affectedSessionIds??[]){const e=this.entries.get(id);if(e){this.hide(e,'blacklist-changed');e.lastAttempt=null;if(this.activeEntry===e)this.update(e)}if(this.threads.has(id))void this.refreshThread(id)}return value}catch(error){this.blacklist.publish({...this.blacklist.getSnapshot(),busy:false,error:true});throw error}}
 threadSource(id){let s=this.threads.get(id);if(!s){s=observable({threadEnabled:true,suspended:null,busy:true});this.threads.set(id,s)}return s}
 async refreshThread(id){const s=this.threadSource(id);try{s.publish({...await this.call('thread',{sessionId:id}),busy:false})}catch{s.publish({...s.getSnapshot(),busy:false,error:true})}}
 async setThread(id,enabled){const s=this.threadSource(id);s.publish({...s.getSnapshot(),busy:true});try{s.publish({...await this.call('setThread',{sessionId:id,enabled}),busy:false});const e=this.entries.get(id);if(e){this.hide(e,'thread-setting');e.lastAttempt=null;if(enabled)this.update(e)}}catch{s.publish({...s.getSnapshot(),busy:false,error:true})}}
 invalidate(reason){for(const e of this.entries.values()){this.hide(e,reason);e.watchAbort?.abort();e.watchAbort=null;e.watchUnsupported=false;e.lastAttempt=null;if(this.activeEntry===e)this.update(e)}}
 async refreshSettings(){
  this.settings.publish({...this.settings.getSnapshot(),busy:true,error:null});
  try{const [p,usage]=await Promise.all([this.call('profiles'),this.call('usage')]);this.settings.publish({...this.settings.getSnapshot(),...Object.fromEntries(['enabled','profileFile','prompt','promptVersion','instructionInfo','activePriceQuote',...POLICY_FIELDS,...LIFECYCLE_FIELDS].filter(k=>p?.[k]!==undefined).map(k=>[k,p[k]])),profiles:Array.isArray(p)?p:p?.profiles??[],usage,busy:false,error:null});if(p?.blacklist)this.blacklist.publish({...p.blacklist,busy:false,error:null})}
  catch(error){this.settings.publish({...this.settings.getSnapshot(),busy:false,error:error.code??'request'})}
 }
 async configure(patch){const v=await this.call('configure',patch);this.settings.publish({...this.settings.getSnapshot(),...patch,...v,error:null});this.invalidate('configuration');await this.refreshSettings()}
 close(){
  if(this.closed)return;this.closed=true;for(const off of [...this.processWatches])off();this.disposeConnection();this.document.removeEventListener('visibilitychange',this.onVisibility);this.window?.removeEventListener('focus',this.onForeground);this.window?.removeEventListener('blur',this.onWindowBlur);
  for(const e of this.entries.values()){e.watchAbort?.abort();this.hide(e,'unload');for(const m of e.mounts)restore(m)}this.entries.clear();this.threads.clear();this.activeEntry=null;
 }
}
module.exports={PredictionClient,observable};

},
"guards.cjs":function(module,exports,require){
'use strict';
function inputEligible(input) {
  return !!input && input.phase==='plain' && input.draft==='' &&
    (input.attachmentIds?.length??0)===0 && (input.occurrences?.length??0)===0 && (input.queue?.length??0)===0;
}
function sessionEligible(session) {
  return !!session && session.openState==='open' && !session.running && !session.removed &&
    !session.blank && !session.awaitingFirstTurn && !session.loadingOlder &&
    (session.pendingSubmissions?.length??0)===0 && session.subagent===null;
}
function acceptanceKey(event) {
  return ['Tab','ArrowRight','Enter'].includes(event.key) && !event.defaultPrevented &&
    !event.isComposing && !event.repeat && event.keyCode!==229 &&
    !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
}
function emptyParagraph(editor) {
  if(!editor || editor.getAttribute('aria-disabled')==='true' || editor.getAttribute('contenteditable')!=='true') return false;
  if(editor.children.length===0)return (editor.textContent??'')==='';
  if(editor.children.length!==1 || editor.children[0].tagName!=='P') return false;
  const paragraph=editor.children[0];
  return (paragraph.textContent??'')==='' && !paragraph.querySelector('[data-lexical-decorator],img,button,input');
}
function editorEligible(editor,card) {
  return emptyParagraph(editor) && !editor.hasAttribute('data-composer-composing') &&
    editor.getAttribute('aria-expanded')!=='true' && !editor.getAttribute('aria-activedescendant') &&
    !card.ownerDocument?.querySelector('[role="dialog"][aria-modal="true"],[role="menu"],[role="listbox"]') &&
    !card.querySelector('[role="combobox"][aria-expanded="true"],[role="listbox"],[role="menu"]');
}
module.exports={inputEligible,sessionEligible,acceptanceKey,emptyParagraph,editorEligible};

},
"locales.cjs":function(module,exports,require){
'use strict';
module.exports={
 en:{quoteAtRefresh:'Quote at refresh',quoteUnpriced:'No API price configured for this backend',quotePeak:'Peak',quoteOffPeak:'Off-peak',quoteUpperBound:'Conservative upper bound; the holiday calendar or billing period is uncertain',quoteChecked:'Price source checked',quoteAuthority:'Charges use the server quote captured when each request starts.',rateinput:'Uncached input',ratecacheRead:'Cache read',ratecacheWrite:'Cache write',rateoutput:'Output',attempts:'Requests',cacheHit:'Cache hit',inputTokens:'Input tokens',cachedTokens:'Cached tokens',outputTokens:'Output tokens',incomplete:'Incomplete usage',unpricedCount:'Unpriced requests',pending:'Pending',upperBound:'Upper bound',saved:'Cache savings',title:'Composer predictions',description:'Suggest the next message. Tab, Right Arrow or Enter inserts an editable draft.',enabled:'Show predictions',backend:'Backend configuration',parent:'Parent request configuration',reload:'Reload configuration',refresh:'Refresh usage',usage:'Prediction usage',unknown:'Usage unavailable',error:'Could not update predictions. Retry.',accept:'Insert suggestion',hint:'Tab to insert',cost:'Recorded costs',unpriced:'Unpriced or incomplete usage',privacy:'Only this conversation is sampled. Suggestions are never sent automatically.',prompt:'Prediction prompt',promptVersion:'Prompt version',save:'Save prompt',promptNote:'The original remote Codex prompt is not public. Configure a versioned prompt here.'},
 zh:{quoteAtRefresh:'刷新时报价',quoteUnpriced:'此后端尚未配置 API 单价',quotePeak:'高峰',quoteOffPeak:'低谷',quoteUpperBound:'节假日日历或计费时段尚未确认，此报价为保守上界',quoteChecked:'价格来源核对时间',quoteAuthority:'实际计费以每次请求开始时保存的服务端报价为准',rateinput:'未命中输入',ratecacheRead:'缓存读取',ratecacheWrite:'缓存写入',rateoutput:'输出',attempts:'请求数',cacheHit:'缓存命中率',inputTokens:'输入 token',cachedTokens:'命中 token',outputTokens:'输出 token',incomplete:'用量不完整',unpricedCount:'未定价请求',pending:'尚未结算',upperBound:'费用上界',saved:'缓存节省',title:'下一条消息预测',description:'预测下一条消息。Tab、右方向键或 Enter 插入可编辑草稿',enabled:'显示预测',backend:'后端配置文件',parent:'沿用父请求配置',reload:'重新加载配置',refresh:'刷新统计',usage:'预测用量',unknown:'暂无可用统计',error:'更新预测失败，请重试',accept:'插入建议',hint:'Tab 插入',cost:'已记录费用',unpriced:'未定价或用量不完整',privacy:'仅采样当前会话，预测不会自动发送',prompt:'预测提示词',promptVersion:'提示词版本',save:'保存提示词',promptNote:'Codex 远程原始提示词未公开，可在此设置有版本的提示词'}
};

Object.assign(module.exports.zh,{
 localGates:'本地限制与重试',lengthMode:'建议长度偏好',lengthshort:'简短',lengthnormal:'普通',lengthlong:'较长',lengthcustom:'自定义',maxTokens:'可见建议 token 硬上限',preferredTokens:'偏好 token 数',language:'预测语言',languageAuto:'自动分析用户语言',networkRetries:'网络追加重试上限',saveLimits:'保存限制',truncate:'超长时本地截断，不因超长重试',languageCheck:'检查语言一致性',automaticRetry:'开启自动重试',retryPolicy:'网络最多追加 3 次；检查失败只修复 1 次。关闭自动重试后，本轮隐藏建议，可手动重试。',visibleTokenNote:'默认最多 999 个可见文本 tokens；不含 JSON 包装和私有推理。未知模型使用明确标记的保守字节上界。',extraInstructions:'用户附加约束与 spec',instructionPriority:'此文件仅用于预测，优先级低于内置强制规则。可直接编辑文件，或在此保存。',saveInstructions:'保存附加约束',predictionHidden:'本次预测已隐藏',retryPrediction:'重试本次预测'
});
Object.assign(module.exports.en,{
 localGates:'Local gates and recovery',lengthMode:'Preferred suggestion length',lengthshort:'Short',lengthnormal:'Normal',lengthlong:'Longer',lengthcustom:'Custom',maxTokens:'Visible suggestion token maximum',preferredTokens:'Preferred token count',language:'Prediction language',languageAuto:'Detect user language',networkRetries:'Additional network retries',saveLimits:'Save limits',truncate:'Truncate overlong text locally instead of retrying for length',languageCheck:'Check language consistency',automaticRetry:'Enable automatic retries',retryPolicy:'At most 3 additional network attempts and one validation repair. With automatic retry disabled, a failure is hidden and can be retried manually.',visibleTokenNote:'Default: at most 999 visible-text tokens, excluding JSON and private reasoning. Unknown models use a labelled conservative UTF-8 byte bound.',extraInstructions:'Additional user constraints and spec',instructionPriority:'Used only for predictions, below mandatory rules. Edit instruction_prediction.md directly or save it here.',saveInstructions:'Save extra constraints',predictionHidden:'This prediction was hidden',retryPrediction:'Retry this prediction'
});

Object.assign(module.exports.zh,{gateLANGUAGE_MISMATCH:'语言不一致',gateSCRIPT_MISMATCH:'简繁体不一致',gateTOO_LONG:'超过长度上限',gateINVALID_JSON:'输出格式不合法',gateCONTROL_CHARACTERS:'包含控制字符',gateINTERNAL_OUTPUT:'包含内部输出',gateROLE_OR_LABEL:'包含角色标签',gateASSISTANT_VIEWPOINT:'使用了助手视角',gateASSISTANT_ECHO:'重复助手回复',gateNO_VISIBLE_CONTENT:'没有可见内容',gateNARRATION:'包含预测解说',gatePROVIDER_TRUNCATED:'供应商输出被截断'});
Object.assign(module.exports.en,{gateLANGUAGE_MISMATCH:'Language mismatch',gateSCRIPT_MISMATCH:'Script mismatch',gateTOO_LONG:'Length limit exceeded',gateINVALID_JSON:'Invalid output format',gateCONTROL_CHARACTERS:'Control characters',gateINTERNAL_OUTPUT:'Internal output',gateROLE_OR_LABEL:'Role label',gateASSISTANT_VIEWPOINT:'Assistant viewpoint',gateASSISTANT_ECHO:'Assistant echo',gateNO_VISIBLE_CONTENT:'No visible text',gateNARRATION:'Prediction commentary',gatePROVIDER_TRUNCATED:'Provider-truncated output'});

Object.assign(module.exports.zh,{repairOutputCap:'修复调用总输出上限（含思考）'});Object.assign(module.exports.en,{repairOutputCap:'Repair output cap including reasoning'});

Object.assign(module.exports.zh,{repairStrategy:'检查失败后的费用策略',repairStrategyauto:'自动比较费用','repairStrategydraft-only':'仅修复失败草稿','repairStrategyparent-regenerate':'保留对话重新预测','repairStrategyparent-with-draft':'保留对话修复草稿',repairCostNote:'根据近期真实用量估计总费用。缓存无法保证；价格或计数不明时优先仅修复草稿。'});
Object.assign(module.exports.en,{repairStrategy:'Recovery cost strategy',repairStrategyauto:'Compare estimated costs','repairStrategydraft-only':'Repair draft only','repairStrategyparent-regenerate':'Regenerate with conversation','repairStrategyparent-with-draft':'Repair draft with conversation',repairCostNote:'Estimates total cost from recent usage. Cache hits are not guaranteed; unknown prices or encodings favor draft-only repair.'});

Object.assign(module.exports.zh,{threadCost:'本线程费用（估算）',shareFormula:'Prediction 占比 = Prediction /（主会话 + Prediction）；包含自动、手动重试和修复。',mainCost:'主会话',predictionCost:'Prediction',combinedCost:'合计',predictionShare:'Prediction 占比',shareUnknown:'用量不完整，暂不计算',noPricedCalls:'暂无已定价请求',shareBasis:'按用量与价表估算；币种分别统计，未定价不算零',shareHistorical:'已读取安装前日志并合并实时记录',shareSinceInstall:'从安装启用统计起，历史尚不可用'});
Object.assign(module.exports.en,{threadCost:'Thread costs (estimated)',shareFormula:'Prediction share = Prediction / (main + Prediction), including retries and repairs.',mainCost:'Main',predictionCost:'Prediction',combinedCost:'Total',predictionShare:'Prediction share',shareUnknown:'Incomplete usage',noPricedCalls:'No priced calls',shareBasis:'Estimated from usage and rates; currencies stay separate and unknown is not zero',shareHistorical:'Historical logs plus live calls',shareSinceInstall:'Since accounting began; history unavailable'});

Object.assign(module.exports.zh,{costViewDescription:'当前会话的主调用与预测开销，按币种分别统计。',refreshCosts:'刷新费用',costCurrency:'币种',costMethod:'统计口径',costLoading:'正在读取费用…',costLoadFailed:'费用读取失败，请点击刷新重试。'});
Object.assign(module.exports.en,{costViewDescription:'Main and prediction costs for this conversation, grouped by currency.',refreshCosts:'Refresh costs',costCurrency:'Currency',costMethod:'Accounting method',costLoading:'Loading costs…',costLoadFailed:'Could not load costs. Refresh to retry.'});

Object.assign(module.exports.zh,{newThreadsEnabled:'新会话默认启用预测',watchdogEnabled:'活跃会话映射自动校验',lifecyclePolicy:'仅当前前台活跃会话运行预测。切换、输入、生成、排队或输入法组合时隐藏建议；同一上下文复用已生成结果。映射校验不调用模型。',contextTargetTokens:'窗口方案的目标输入 tokens',minRetainedCacheRatio:'历史被改写时允许保留的最低缓存比例（0.5–1）',enableThreadPrediction:'开启此会话的 Prediction',disableThreadPrediction:'关闭此会话的 Prediction',resumeThreadPrediction:'恢复此会话的 Prediction（缓存变化后暂停）'});
Object.assign(module.exports.en,{newThreadsEnabled:'Enable predictions for new conversations',watchdogEnabled:'Validate active conversation mappings',lifecyclePolicy:'Predictions run only for the foreground active conversation. Switching, typing, generation, queued messages and IME hide suggestions. Identical context reuses an existing result; mapping checks do not call a model.',contextTargetTokens:'Target input tokens for window strategies',minRetainedCacheRatio:'Minimum retained cache ratio after a history rewrite (0.5–1)',enableThreadPrediction:'Enable Prediction for this conversation',disableThreadPrediction:'Disable Prediction for this conversation',resumeThreadPrediction:'Resume Prediction after cache changes'});

Object.assign(module.exports.zh,{contextQualityCostSlack:'为保留更多上下文允许的费用差（0–0.25，0 为严格最低估算费用）'});Object.assign(module.exports.en,{contextQualityCostSlack:'Cost slack for retaining more context (0–0.25; 0 selects minimum estimated cost)'});

Object.assign(module.exports.zh,{statusloading:'正在预测下一条消息…',statuschecking:'正在校验预测…',statussuspended:'本会话预测已暂停：上下文前缀变化较大。可右键会话恢复。'});Object.assign(module.exports.en,{statusloading:'Predicting the next message…',statuschecking:'Checking the prediction…',statussuspended:'Prediction paused after a large context-prefix change. Resume from this conversation’s menu.'});

Object.assign(module.exports.zh,{
 lifecyclePolicy:'由用户发送与助手正常结束驱动。映射按轮次、token 增量、发送密度和结构事件校验，不按秒轮询。已有预测长期保存，切换窗口不触发重算。',
 watchdogEnabled:'开启事件驱动的映射校验',retroactiveEnabled:'开启功能时为已有线程补生成',retroactiveHours:'补生成窗口（小时，仅用于已有线程）',retroactiveLimit:'补生成最多线程数（按用户最后发送时间排序）',
 processEvents:'当前线程状态与特殊事件',eventHistory:'事件记录',statussuspended:'本会话预测已暂停：可保留前缀低于 50%。可右键会话恢复。'
});
Object.assign(module.exports.en,{
 lifecyclePolicy:'User submissions and normally completed replies drive generation. Mapping checks use turns, token deltas, send density and structural events, not second-based polling. Existing predictions persist; switching windows never purchases a new result.',
 watchdogEnabled:'Event-driven mapping validation',retroactiveEnabled:'Backfill existing conversations when enabling',retroactiveHours:'Backfill window in hours (existing conversations only)',retroactiveLimit:'Maximum backfilled conversations, newest user submission first',
 processEvents:'Conversation status and special events',eventHistory:'Event history',statussuspended:'Prediction paused: less than 50% of the prefix is retained. Resume from the conversation menu.'
});
const labels={
 'cache-prefix-loss':['上下文变化导致可保留缓存低于阈值，已暂停','Paused after excessive context-prefix loss'],
 'context-limit':['上下文超过限制，未发送预测请求','Context limit exceeded; prediction was not dispatched'],
 'mapping-tool-pair':['工具调用与结果映射不完整，已跳过预测','Incomplete tool-call/result mapping; prediction skipped'],
 'history-read-failed':['无法安全读取本线程历史，已跳过预测','Conversation history could not be read safely'],
 'retroactive-read-failed':['无法读取补生成候选线程','Could not read backfill candidates'],
 'retroactive-outside-window':['本线程超出补生成窗口；已有结果仍可使用','Outside the backfill window; existing results remain usable'],
 'retroactive-limit':['本线程不在最近的补生成名额内','Outside the newest backfill selection'],
 'assistant-not-completed':['助手未正常结束，本轮不生成预测','Reply did not finish normally; no prediction for this attempt'],
 'network-retry':['预测请求遇到网络问题，正在按设置重试','Network problem; retrying according to policy'],
 'validation-repair':['预测未通过本地检查，正在修复','Prediction failed a local check; repairing'],
 'generation-error':['本次预测失败，可手动重试','Prediction failed; manual retry is available'],
 'stale-response-discarded':['来源上下文已变化，过期结果已丢弃','Source changed; stale result discarded'],
 'external-editing':['上下文正在编辑，暂不显示预测','Context is being edited; predictions are hidden'],
 'context-compacted':['主线程上下文已压缩，正在重新校验映射','Parent context was compacted; validating the new mapping'],
 'low-observed-cache-hit':['本次实际缓存命中较低，已记录费用','Observed cache hit was low; costs were recorded'],
 'connection-error':['预测服务连接异常，等待重新连接','Prediction connection failed; awaiting reconnection'],
 'retroactive-disabled':['已有线程的自动补生成已关闭','Automatic backfill was disabled'],
 'retroactive-selected':['已按最后用户发送时间选入补生成窗口','Selected for backfill by last user submission'],
 'retroactive-start':['正在补生成本线程的预测','Backfilling this conversation'],
 'user-submitted':['用户已发送，等待本轮正常回复','User submitted; awaiting a normally completed reply'],
 'assistant-running':['助手正在生成，暂不显示预测','Assistant is running; prediction hidden'],
 'assistant-completed':['助手已正常结束，预测正在排队','Reply completed normally; prediction queued'],
 'context-changed':['对话映射发生变化，旧预测已失效','Conversation mapping changed; old prediction invalidated'],
 'parent-request':['已校验本轮主请求映射','Current parent-request mapping observed'],
 'prediction-request':['正在生成本轮预测','Generating this loop’s prediction'],
 'prediction-ready':['本轮预测已保存，可直接复用','Prediction saved and ready for reuse'],
 'abstained':['本轮证据不足，未提供预测','Insufficient evidence; prediction abstained'],
 'configuration-changed':['配置已改变，正在重新校验','Configuration changed; validating again'],
 'thread-enabled':['已开启此线程预测','Predictions enabled for this conversation'],
 'thread-disabled':['已关闭此线程预测','Predictions disabled for this conversation'],
 'accepted':['预测已插入草稿，尚未发送','Prediction inserted as an unsent draft'],
 'other':['预测状态','Prediction status']
};
for(const [code,[zh,en]] of Object.entries(labels)){module.exports.zh['event:'+code]=zh;module.exports.en['event:'+code]=en;}

Object.assign(module.exports.zh,{'event:retroactive-waiting-normal-reply':'助手尚未正常结束，暂不补生成；正常回复后再预测。'});Object.assign(module.exports.en,{'event:retroactive-waiting-normal-reply':'Waiting for a normally completed assistant reply before backfilling.'});

module.exports.zh.gateUNSUPPORTED_PRICE_ASSUMPTION='建议引入了上下文未提供的价格或费率';
module.exports.en.gateUNSUPPORTED_PRICE_ASSUMPTION='Suggestion introduced unsupported prices or rates';

module.exports.zh['event:cached-validation-rejected']='已存建议未通过新增价格检查，已隐藏；可手动修复';
module.exports.en['event:cached-validation-rejected']='Stored suggestion failed a new price check; hidden pending manual repair';

module.exports.zh['event:retroactive-superseded']='配置已变化，旧补生成批次已撤销，未继续发送';
module.exports.en['event:retroactive-superseded']='Configuration changed; the previous backfill batch was revoked';

Object.assign(module.exports.zh,{firstUseTitle:'使用 Tab 补全下一条消息',completionHelp:'输入框为空且预测就绪时，按 Tab 可将预测填入可编辑草稿；不会自动发送。',firstUseConfirm:'知道了',eventOrderNote:'从早到晚排列；1 为当前列表中最早的事件，当前状态对应最后一条。仅保留最近 32 条。'});
Object.assign(module.exports.en,{firstUseTitle:'Complete your next message with Tab',completionHelp:'When the composer is empty and a prediction is ready, press Tab to insert an editable draft. It is never sent automatically.',firstUseConfirm:'Got it',eventOrderNote:'Oldest to newest. Item 1 is the earliest retained event; the current status matches the last item. Only the latest 32 events are retained.'});

Object.assign(module.exports.zh,{blacklistTitle:'Prediction 黑名单',blacklistHelp:'黑名单优先于默认开启及线程开关。工作区按列表中的身份屏蔽其所属线程；移出后保留原开关，缺失预测等待下一轮正常回复。',workspaceBlacklist:'工作区',threadBlacklist:'已屏蔽的线程',noWorkspaces:'暂无可用工作区',noBlockedThreads:'暂无单独屏蔽的线程',removeBlacklist:'移出黑名单',addThreadBlacklist:'加入 Prediction 黑名单',removeThreadBlacklist:'移出 Prediction 黑名单',addWorkspaceBlacklist:'屏蔽此工作区的 Prediction',removeWorkspaceBlacklist:'解除此工作区的 Prediction 屏蔽',blacklistEffective:'Prediction 已被黑名单屏蔽',blacklistError:'黑名单更新失败，请重试','event:thread-blacklisted':'此线程已加入 Prediction 黑名单','event:workspace-blacklisted':'所属工作区已屏蔽 Prediction','event:blacklist-unavailable':'无法核对工作区黑名单，已暂停预测','event:blacklist-removed':'已移出黑名单，沿用原有线程设置',eventOrderNote:'从早到晚排列；1 为保留列表中最早事件，最后一条为最新事件。仅保留最近 32 条。'});
Object.assign(module.exports.en,{blacklistTitle:'Prediction blacklist',blacklistHelp:'The blacklist overrides default and conversation switches. A workspace blocks its member conversations by workspace identity. Removing an entry preserves the existing switches; missing predictions wait for the next normal reply.',workspaceBlacklist:'Workspaces',threadBlacklist:'Blocked conversations',noWorkspaces:'No workspaces available',noBlockedThreads:'No individually blocked conversations',removeBlacklist:'Remove',addThreadBlacklist:'Block predictions for this conversation',removeThreadBlacklist:'Remove conversation from prediction blacklist',addWorkspaceBlacklist:'Block predictions for this workspace',removeWorkspaceBlacklist:'Unblock predictions for this workspace',blacklistEffective:'Predictions blocked by blacklist',blacklistError:'Could not update blacklist. Retry.','event:thread-blacklisted':'Conversation is on the prediction blacklist','event:workspace-blacklisted':'Workspace blocks predictions','event:blacklist-unavailable':'Cannot verify workspace blacklist; predictions paused','event:blacklist-removed':'Removed from blacklist; existing switches still apply',eventOrderNote:'Oldest to newest. Item 1 is the earliest retained event; the last item is the newest event. Only the latest 32 events are retained.'});

Object.assign(module.exports.zh,{"settingsIntro": "更顺手的下一条消息，更透明的预测开销", "behaviorTitle": "预测行为", "behaviorDescription": "从正常完成的回复继续，保留你对下一条消息的决定权。", "enabledHelp": "就绪时在空输入框显示建议；接受后仍需你手动发送。", "newThreadHelp": "仅影响新建线程。已有线程沿用各自的开关和黑名单设置。", "watchdogHelp": "按轮次、token 增量和结构变化检查映射，不使用秒级轮询。", "backendTitle": "后端与缓存", "backendHelp": "优先复用稳定前缀，并在实际请求开始时冻结计费规则。", "backendChoiceHelp": "沿用父请求可保持模型、工具和缓存亲和配置。", "parentQuoteHelp": "父配置随会话而定，没有统一单价。每次调用按该线程实际后端与模型报价；费用页保留请求当时的价格。", "contextPolicyTitle": "上下文预算与前缀保留", "contextBudgetHelp": "本地选择器的目标预算，仍受模型实际上下文上限约束。", "prefixGateHelp": "历史被修改后，保留前缀比例低于 50% 会暂停该线程预测。此门槛只能提高。", "reliabilityTitle": "限制与重试", "reliabilityHelp": "在本地校验长度、语言、格式和用户视角，再决定是否显示。", "hardLimitHelp": "默认少于 1000 tokens。超限时按截断或最多一次修复策略处理。", "languageGateHelp": "独立于应用界面语言，检查建议是否符合对话语言。", "truncateHelp": "超过硬上限时直接截断，不额外发起长度修复请求。", "recoveryOptions": "重试上限与费用选择", "existingTitle": "已有线程补齐", "existingHelp": "窗口只用于开启功能时补齐旧线程，不是预测结果的有效期。", "unsavedChanges": "有尚未保存的数值设置", "blacklistDescription": "工作区和线程黑名单优先于任何默认开关，不删除历史结果或账目。", "instructionsTitle": "自定义约束", "usageTitle": "用量与费用", "usageHelp": "按物理请求记录，包含修复和重试；线程费用页显示 Prediction / 合计。", "aboutTitle": "关于与更新", "localPreview": "本地预览版本 · 本轮尚未发布 npm", "nativeUpdateHelp": "发布到 npm 并从该来源安装后，由 DSH 原生插件详情页检查和安装更新。当前本地链接没有在线更新通道。", "releaseNotes": "本版更新", "releaseUI": "独立设置导航、官方控件和中英文插件详情。", "releaseBlacklist": "工作区与线程黑名单，可持久保存并阻止迟到结果重新显示。", "releaseValidation": "保留长度、语言、弃答和重试的本地校验。", "releaseCache": "沿用稳定缓存前缀，按每次物理请求记录价格和 usage。", "settingsSaveError": "保存失败，请检查输入并重试；之前的配置仍保留。", "settingsSaved": "已保存", "settingsSaving": "正在保存…"});
Object.assign(module.exports.en,{"settingsIntro": "A smoother next message. A clearer prediction bill.", "behaviorTitle": "Prediction behavior", "behaviorDescription": "Continue from normally completed replies while keeping the next message in your hands.", "enabledHelp": "Show a ready suggestion in an empty composer. Accepting it never sends it.", "newThreadHelp": "Applies to newly created conversations. Existing switches and blacklist entries stay in effect.", "watchdogHelp": "Check mappings by turns, token deltas and structural changes, without second-based polling.", "backendTitle": "Backend and cache", "backendHelp": "Reuse stable prefixes and capture pricing when each physical request starts.", "backendChoiceHelp": "Parent configuration preserves model, tools and cache affinity.", "parentQuoteHelp": "Parent configuration varies by conversation, so it has no single global price. Each call uses the actual backend and model; the cost view keeps its request-time quote.", "contextPolicyTitle": "Context budget and prefix retention", "contextBudgetHelp": "A target for the local selector, still bounded by the model's actual context limit.", "prefixGateHelp": "After history edits, retaining less than 50% of the prefix pauses predictions. This threshold can only be raised.", "reliabilityTitle": "Limits and retries", "reliabilityHelp": "Validate length, language, format and user viewpoint locally before displaying a suggestion.", "hardLimitHelp": "Below 1,000 tokens by default. Overflow follows truncation or at most one repair.", "languageGateHelp": "Separate from the application language, this checks the language of the conversation.", "truncateHelp": "Truncate at the hard limit without buying an extra length-repair request.", "recoveryOptions": "Retry limits and recovery cost", "existingTitle": "Existing conversations", "existingHelp": "The window is used to backfill old conversations when enabled. It is not a result expiration time.", "unsavedChanges": "Unsaved numeric settings", "blacklistDescription": "Workspace and conversation blacklists override defaults without deleting history or accounting.", "instructionsTitle": "Custom instructions", "usageTitle": "Usage and cost", "usageHelp": "Record physical requests, including repairs and retries. Per-conversation costs show Prediction / combined total.", "aboutTitle": "About and updates", "localPreview": "Local preview · not published to npm in this run", "nativeUpdateHelp": "After publication and installation from npm, use DSH's native plugin detail page to check and install updates. The current local link has no online update channel.", "releaseNotes": "What's new", "releaseUI": "Dedicated settings navigation, native controls and bilingual plugin details.", "releaseBlacklist": "Persistent workspace and conversation blacklists, including late-result protection.", "releaseValidation": "Local length, language, abstention and retry checks remain in place.", "releaseCache": "Stable prefix reuse with price and usage recorded for each physical request.", "settingsSaveError": "Could not save. Check the values and retry; the previous configuration is retained.", "settingsSaved": "Saved", "settingsSaving": "Saving…"});

module.exports.zh.usageHelp='按物理请求记录，包含修复和重试。按公开价表估算，不等于平台账单；未知用量不按零计。线程费用页显示 Prediction / 合计。';
module.exports.en.usageHelp='Record physical requests, including repairs and retries. Public-price estimates are not the provider bill; unknown usage is never treated as zero. Per-conversation costs show Prediction / combined total.';

Object.assign(module.exports.zh,{'event:context-changed':'对话上下文已更新','event:context-updated':'上下文已更新，尚无可用预测需要撤销','event:prediction-invalidated':'来源已变化，先前候选已失效','event:parent-request':'已记录主请求上下文快照','event:assistant-completed':'助手已正常结束','event:prediction-queued':'预测已进入待处理队列',costTabTitle:'预测费用','phase:disabled':'预测功能已关闭','phase:thread-disabled':'此线程预测已关闭','phase:thread-blacklisted':'此线程已被黑名单屏蔽','phase:workspace-blacklisted':'所属工作区已屏蔽预测','phase:blacklist-unavailable':'无法核对工作区黑名单，已暂停','phase:paused':'预测已暂停，请查看事件原因','phase:assistant-running':'助手正在生成，暂不展示预测','phase:awaiting-assistant':'等待本轮助手正常结束','phase:requesting':'正在请求本轮预测','phase:queued':'预测确实位于待处理队列','phase:checking':'正在准备和校验预测来源','phase:ready':'本轮预测已保存，可直接复用','phase:accepted':'预测已填入草稿，尚未发送','phase:abstained':'本轮证据不足，不展示预测','phase:failed':'本轮预测失败，请查看事件原因','phase:no-pending-prediction':'当前没有待生成的预测；等待新的用户轮次'});
Object.assign(module.exports.en,{'event:context-changed':'Conversation context updated','event:context-updated':'Context updated; no usable candidate needed invalidation','event:prediction-invalidated':'Source changed; the previous candidate is invalid','event:parent-request':'Recorded main-request context snapshot','event:assistant-completed':'Assistant completed normally','event:prediction-queued':'Prediction entered the work queue',costTabTitle:'Prediction costs','phase:disabled':'Predictions disabled','phase:thread-disabled':'Predictions disabled for this conversation','phase:thread-blacklisted':'Conversation blacklisted','phase:workspace-blacklisted':'Workspace blocks predictions','phase:blacklist-unavailable':'Cannot verify workspace blacklist; paused','phase:paused':'Prediction paused; see events','phase:assistant-running':'Assistant running; prediction hidden','phase:awaiting-assistant':'Waiting for normal assistant completion','phase:requesting':'Requesting a prediction','phase:queued':'Prediction is in the work queue','phase:checking':'Preparing and checking the prediction source','phase:ready':'Prediction saved and reusable','phase:accepted':'Prediction inserted as an unsent draft','phase:abstained':'Insufficient evidence; no suggestion','phase:failed':'Prediction failed; see events','phase:no-pending-prediction':'No pending prediction; waiting for a new user turn'});

module.exports.zh['event:prediction-skipped']='本次检查后无需生成预测';module.exports.en['event:prediction-skipped']='No prediction needed after the source check';

Object.assign(module.exports.zh,{'event:context-compacted':'历史压缩或裁剪通知（旧版未区分类型）','event:legacy-compaction-group':'历史压缩/裁剪通知 ×{count}（已合并；不代表模型调用次数）','event:context-pruned':'已本地裁剪 {count} 项工具结果；未调用模型','event:context-summary-started':'主线程摘要流程已开始','event:context-summary-ended':'主线程摘要流程已结束','event:price-unavailable':'缺少适用价格，本次预测未发送','event:billing-unreconciled':'预测用量尚未核对，已停止自动重试及后续预测',shareUnknown:'存在未核对金额，完整线程占比暂不可算',trackedCoverage:'安装后完整统计',trackedCoverageNote:'仅包含安装统计器后的请求；下列金额与占比使用同一区间，不冒充整个线程。',trackedAttempts:'主请求 / 预测尝试数',providerRejected:'已识别的余额不足拒绝请求（未生成）','billingReason:no-effective-price-version':'历史请求缺适用价表','billingReason:usage-missing':'请求缺少服务端用量','billingReason:quote-missing':'请求缺少价格','billingReason:usage-incomplete':'服务端用量不完整',eventOrderNote:'从早到晚显示；重复旧版压缩/裁剪通知按组展示，原始记录保留。最多保留最近 32 条原始事件。'});
Object.assign(module.exports.en,{'event:context-compacted':'Legacy compaction/pruning notice (type was not distinguished)','event:legacy-compaction-group':'Legacy compaction/pruning notices ×{count} (grouped; not model call counts)','event:context-pruned':'Locally pruned {count} tool results; no model call','event:context-summary-started':'Parent summary workflow started','event:context-summary-ended':'Parent summary workflow ended','event:price-unavailable':'No applicable price; prediction was not sent','event:billing-unreconciled':'Prediction usage unresolved; automatic retries and further predictions stopped',shareUnknown:'Unreconciled amounts prevent a complete conversation share',trackedCoverage:'Complete accounting since installation',trackedCoverageNote:'Only requests after accounting installation; amounts and share use the same interval, not the whole conversation.',trackedAttempts:'Main / prediction attempts',providerRejected:'Insufficient-balance requests rejected before generation','billingReason:no-effective-price-version':'Historical requests without an applicable price version','billingReason:usage-missing':'Requests missing provider usage','billingReason:quote-missing':'Requests missing price','billingReason:usage-incomplete':'Incomplete provider usage',eventOrderNote:'Oldest first; repeated legacy compaction/pruning notices are grouped for display. Original records are retained, up to the latest 32 events.'});

module.exports.zh.knownSubtotal='已定价小计';module.exports.en.knownSubtotal='Priced subtotal';

Object.assign(module.exports.zh,{balanceWatchdogEnabled:'余额监测与自动恢复',balanceWatchdogHelp:'余额不足只暂停自动预测。按对话逻辑事件、返回应用等检查余额；查到可用后重新校验待预测轮次并恢复。手动重试不受余额暂停影响，不按秒轮询。',checkBalance:'检查余额',balanceChecking:'正在检查余额…',balancePassivePaused:'自动预测已因余额不足暂停',balancePassiveAvailable:'余额检查已完成，自动预测可恢复',balanceManualAlways:'手动重试始终保留；余额暂停不拦截手动请求。',balanceChecks:'余额查询次数（非模型生成）',balanceUnknown:'余额尚未查明，继续等待；手动重试仍可使用。',balancePausedNotice:'自动预测等待余额恢复，手动重试可用',historicalRejections:'历史拒绝记录','phase:balance-paused':'自动预测等待余额恢复；手动重试可用','event:balance-paused':'余额不足，已暂停自动预测；手动重试可用','event:balance-checking':'Watchdog 正在查询账户余额（非模型请求）','event:balance-still-empty':'账户仍无可用余额，继续暂停自动预测','event:balance-available':'账户余额可用，正在检查是否恢复自动预测','event:balance-resuming':'余额已恢复，待预测轮次仍有效，恢复一次自动预测','event:balance-resume-skipped':'余额恢复，但原待预测轮次已不适用，跳过自动恢复','event:balance-query-failed':'余额查询失败，未据此判断余额为零；手动重试可用','event:balance-query-unavailable':'当前后端不支持此余额接口；手动重试可用','event:balance-ready-manual-only':'余额已恢复；自动重试已关闭，请手动重试'});
Object.assign(module.exports.en,{balanceWatchdogEnabled:'Balance monitoring and automatic recovery',balanceWatchdogHelp:'Insufficient balance pauses automatic predictions only. Check on conversation events and app return; validate pending sources before resuming. Manual retries remain available. No timed polling.',checkBalance:'Check balance',balanceChecking:'Checking balance…',balancePassivePaused:'Automatic predictions paused for insufficient balance',balancePassiveAvailable:'Balance check completed; automatic predictions can recover',balanceManualAlways:'Manual retry remains available and bypasses the balance pause.',balanceChecks:'Balance queries (not model generations)',balanceUnknown:'Balance is unknown; waiting continues and manual retry remains available.',balancePausedNotice:'Waiting for balance recovery; manual retry available',historicalRejections:'Historical rejected requests','phase:balance-paused':'Waiting for balance recovery; manual retry available','event:balance-paused':'Insufficient balance; automatic prediction paused, manual retry available','event:balance-checking':'Watchdog is checking account balance (not a model request)','event:balance-still-empty':'No available balance; automatic predictions remain paused','event:balance-available':'Balance available; checking pending predictions for recovery','event:balance-resuming':'Balance recovered and source still valid; resuming one automatic prediction','event:balance-resume-skipped':'Balance recovered, but the old pending source is no longer applicable','event:balance-query-failed':'Balance query failed; not treated as a zero balance. Manual retry available','event:balance-query-unavailable':'This backend does not support this balance interface; manual retry available','event:balance-ready-manual-only':'Balance recovered; automatic retry is disabled, please retry manually'});

module.exports.zh.balanceUnknownTitle='账户余额尚未查明';module.exports.en.balanceUnknownTitle='Account balance is not yet known';

module.exports.zh.balancePassiveAvailable='检查结果：账户余额可用';module.exports.en.balancePassiveAvailable='Check result: account balance available';

Object.assign(module.exports.zh,{balanceWatchdogHelp:'仅真实主请求或预测明确报额度不足后启动。按对话事件、返回应用检查；余额恢复或真实调用成功即停止。第三方无余额接口时等待手动请求成功恢复，不发送收费探测。手动查到零不会启动监测。',balanceUnknown:'余额接口尚未确认可用；这不是零余额的证据。手动重试仍可使用。','event:balance-observed-empty':'手动查询报告余额不可用；未发生额度拒绝，不启动自动监测',compatibilityHelp:'支持 Responses、Anthropic Messages、OpenAI Chat Completions 配置文件。第三方按声明的能力发送可选字段，不自动探测或切换协议；缓存明细缺失时显示费用上界，不伪造命中率。缺少价表时不发送自动预测。',shareRange:'占比范围（缓存明细缺失）'});
Object.assign(module.exports.en,{balanceWatchdogHelp:'Arm only after a real main/prediction request explicitly reports insufficient quota. Check on logical events/app return; stop after balance recovery or a successful model request. Without a balance API, manual success recovers; no paid probes. A manual zero-balance check does not arm monitoring.',balanceUnknown:'The balance API has not confirmed availability; this is not proof of a zero balance. Manual retry remains available.','event:balance-observed-empty':'Manual check reports unavailable funds; no quota rejection occurred, so monitoring is not armed',compatibilityHelp:'Profiles support Responses, Anthropic Messages and OpenAI Chat Completions. Optional fields follow declared capabilities, with no protocol probing or silent fallback. Missing cache details produce cost bounds, never invented cache hits. Automatic prediction requires a pricebook.',shareRange:'Share range (cache details missing)'});

Object.assign(module.exports.zh,{reasoningMode:'预测思考策略',reasoningMinimum:'关闭／最低（默认）',reasoningConfigured:'按后端配置',reasoningHelp:'默认能关闭就关闭，否则使用模型最低档。选择“按后端配置”后，使用父请求或所选配置文件的思考参数，可能产生更多思考费用。修改后需保存；当前轮不自动重算，需手动触发。',saveLimits:'保存设置'});
Object.assign(module.exports.en,{reasoningMode:'Prediction reasoning',reasoningMinimum:'Off / minimum (default)',reasoningConfigured:'Use backend configuration',reasoningHelp:'Thinking is disabled when supported; otherwise the model minimum is used. Backend configuration uses the parent request or selected profile controls and may cost more. Save to apply. The current turn is not automatically regenerated; retry manually.',saveLimits:'Save settings'});

},
"policy-fields.cjs":function(module,exports,require){
'use strict';module.exports={POLICY_FIELDS:['reasoningMode','automaticRetry','networkRetryLimit','validationRepairLimit','maxSuggestionTokens','lengthMode','preferredSuggestionTokens','truncationEnabled','languageCheck','predictionLanguage','rejectExplanations','userViewpointCheck','retryBaseDelayMs','retryMaxDelayMs','repairCompressionRatio','repairMaxOutputTokens','maxRepairInputBytes','instructionMaxBytes','repairStrategy','repairMinSavingsRatio','repairCacheDiscount','repairCacheTtlMs']};
},
"controls.cjs":function(module,exports,require){
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

},
"placeholder.cjs":function(module,exports,require){
'use strict';
const HINT='--dsh-composer-hint',OWNER='data-dsh-prediction-ghost';
function cssString(text){return '"'+text.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r\n?|\n/g,'\\a ').replace(/\t/g,'\\9 ')+'"'}
function ghostAvailable(mount){const editor=mount.editor;if(!editor?.style?.getPropertyValue)return false;const current=editor.style.getPropertyValue(HINT);return !current||mount.ghost?.editor===editor&&current===mount.ghost.appliedValue}
function restore(mount){
 const ghost=mount.ghost;
 if(ghost&&ghost.editor.getAttribute(OWNER)===mount.owner){if(ghost.editor.style.getPropertyValue(HINT)===ghost.appliedValue&&ghost.editor.style.getPropertyPriority(HINT)===ghost.appliedPriority){if(ghost.value)ghost.editor.style.setProperty(HINT,ghost.value,ghost.priority);else ghost.editor.style.removeProperty(HINT)}ghost.editor.removeAttribute(OWNER)}
 mount.ghost=null;
 const saved=mount.placeholder;
 if(saved&&saved.node.getAttribute('data-dsh-prediction-owner')===mount.owner){if(saved.node.style.getPropertyValue('visibility')==='hidden'&&saved.node.style.getPropertyPriority('visibility')===saved.appliedPriority){if(saved.value)saved.node.style.setProperty('visibility',saved.value,saved.priority);else saved.node.style.removeProperty('visibility')}saved.node.removeAttribute('data-dsh-prediction-owner')}
 mount.placeholder=null;mount.node.removeAttribute?.('data-dsh-prediction-show');
}
function paint(mount,show,text){
 if(!show||typeof text!=='string'||!text){restore(mount);return}
 const editor=mount.editor;if(!editor||!ghostAvailable(mount)){restore(mount);return}
 if(mount.ghost&&mount.ghost.editor!==editor)restore(mount);
 if(!mount.ghost){mount.ghost={editor,value:editor.style.getPropertyValue(HINT),priority:editor.style.getPropertyPriority(HINT)};editor.setAttribute(OWNER,mount.owner)}
 const ghost=mount.ghost,value=cssString(text);ghost.appliedValue=value;ghost.appliedPriority='';
 if(editor.style.getPropertyValue(HINT)!==value||editor.style.getPropertyPriority(HINT))editor.style.setProperty(HINT,value);
 const node=mount.card.querySelector('[data-composer-placeholder]');
 if(mount.placeholder?.node!==node){const old=mount.placeholder;if(old&&old.node.getAttribute('data-dsh-prediction-owner')===mount.owner){if(old.node.style.getPropertyValue('visibility')==='hidden'&&old.node.style.getPropertyPriority('visibility')===old.appliedPriority){if(old.value)old.node.style.setProperty('visibility',old.value,old.priority);else old.node.style.removeProperty('visibility')}old.node.removeAttribute('data-dsh-prediction-owner')}mount.placeholder=node?{node,value:node.style.getPropertyValue('visibility'),priority:node.style.getPropertyPriority('visibility')}:null;if(node)node.setAttribute('data-dsh-prediction-owner',mount.owner)}
 if(node?.getAttribute('data-dsh-prediction-owner')===mount.owner){if(node.style.getPropertyValue('visibility')!=='hidden'||node.style.getPropertyPriority('visibility')!=='important')node.style.setProperty('visibility','hidden','important');mount.placeholder.appliedPriority=node.style.getPropertyPriority('visibility')}
 mount.node.setAttribute?.('data-dsh-prediction-show','');
}
module.exports={paint,restore,ghostAvailable,cssString};

},
"events.cjs":function(module,exports,require){
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

},
"onboarding.cjs":function(module,exports,require){
'use strict';
const KEY='dsh.composerPrediction.firstUse.v1';
const acknowledged=new WeakSet();
function showFirstUseNotice(doc,t){
 if(!doc?.body||acknowledged.has(doc))return()=>{};
 try{if(doc.defaultView.localStorage.getItem(KEY)==='acknowledged')return()=>{}}catch{}
 if(doc.querySelector('[data-dsh-prediction-first-use]'))return()=>{};
 const dialog=doc.createElement('dialog');dialog.className='dsh-prediction-first-use';dialog.setAttribute('data-dsh-prediction-first-use','');dialog.setAttribute('aria-labelledby','dsh-prediction-first-use-title');
 const title=doc.createElement('h2');title.id='dsh-prediction-first-use-title';title.textContent=t('firstUseTitle');
 const text=doc.createElement('p');text.textContent=t('completionHelp');
 const button=doc.createElement('button');button.type='button';button.autofocus=true;button.textContent=t('firstUseConfirm');
 const remember=()=>{acknowledged.add(doc);try{doc.defaultView.localStorage.setItem(KEY,'acknowledged')}catch{};dialog.remove()};
 button.addEventListener('click',()=>{if(typeof dialog.close==='function')dialog.close();remember()});
 dialog.addEventListener('close',remember);
 dialog.append(title,text,button);doc.body.append(dialog);
 try{if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','')}catch{dialog.setAttribute('open','')}
 return()=>{dialog.removeEventListener('close',remember);dialog.remove()};
}
module.exports={showFirstUseNotice,KEY};

},
"blacklist.cjs":function(module,exports,require){
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

},
"settings.cjs":function(module,exports,require){
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

},
"brand.cjs":function(module,exports,require){
'use strict';
module.exports={brand:{"version": "0.8.0-beta.4", "icon": "data:image/png;base64,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"}};

}};const cache=Object.create(null);
function load(id){if(cache[id])return cache[id].exports;const fn=definitions[id];if(!fn)return require(id);const module={exports:{}};cache[id]=module;fn(module,module.exports,(request)=>request.startsWith("./")?load(request.slice(2)):require(request));return module.exports;}
return load("index.cjs");
}});
//# sourceMappingURL=client.js.map
