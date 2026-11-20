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
