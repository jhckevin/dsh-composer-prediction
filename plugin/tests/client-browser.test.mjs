import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {buildClient} from '../src/client/build.mjs';
let qa=createRequire(import.meta.url);
try{qa.resolve('jsdom');}catch{qa=createRequire(new URL('../../.qa/package.json',import.meta.url));}
const {JSDOM}=qa('jsdom');
const React=qa('react');
const {act}=React;
const {createRoot}=qa('react-dom/client');
const require=createRequire(import.meta.url);
const {observable}=require('../src/client/controller.cjs');
const input=()=>({phase:'plain',draft:'',draftRev:1,attachmentIds:[],occurrences:[],queue:[]});
const session=()=>({openState:'open',running:false,removed:false,blank:false,awaitingFirstTurn:false,loadingOlder:false,pendingSubmissions:[],subagent:null});
async function flush(){await act(async()=>{await new Promise(resolve=>setTimeout(resolve,5));});}
async function fixture({quote={status:'unpriced'},sample,threadAccounting,process,watch,showComposer=true,showCosts=false,emptyRoot=false,hostState={},accept,focus=true,strict=false,showMenu=false,profileFile='parent',blacklistData={workspaces:[],blockedWorkspaces:[],blockedThreads:[],workspaceLookupAvailable:true}}={}){
 const dom=new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>',{url:'http://localhost',pretendToBeVisual:true});
 const window=dom.window,document=window.document;document.hasFocus=()=>focus;window.HTMLElement.prototype.getClientRects=()=>[{left:0,top:0,width:600,height:80}];
 globalThis.window=window;globalThis.document=document;globalThis.HTMLElement=window.HTMLElement;globalThis.Element=window.Element;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let localeChoice=null;const localeListeners=new Set();
 const menuContributions=[],registrations=[],effects=[],calls=[],connection=observable({id:1}),inputSource=observable(input()),sessionSource=observable(session());
 let settings={enabled:true,profileFile,prompt:'Suggest next message',promptVersion:'v1'};
 const rpc={async call(channel,method,payload,signal){
  calls.push({channel,method,payload,signal});
  let value=null;
  if(method==='state'||method==='observe')value={...settings,eligible:true,expectedTurnId:1,revision:'r1',configVersion:1,...hostState};
  if(method==='watch')value=watch?await watch(payload,signal):null;
  if(method==='accept')value=accept?await accept(payload):{valid:true};
  if(method==='thread')value={threadEnabled:settings.threadEnabled??true,suspended:null};
  if(method==='setThread'){settings.threadEnabled=payload.enabled;value={threadEnabled:payload.enabled,suspended:null};}
  if(method==='sample')value=sample?sample(payload,calls.filter(x=>x.method==='sample').length):{suggestion:'Continue with the tests'};
  if(method==='blacklist')value=blacklistData;
  if(method==='setBlacklist'){const key=payload.scope==='workspace'?'blockedWorkspaces':'blockedThreads';blacklistData={...blacklistData,[key]:[...blacklistData[key].filter(x=>x.id!==payload.id),...payload.blocked?[{id:payload.id,label:payload.label??payload.id}]:[]]};blacklistData.workspaces=blacklistData.workspaces.map(x=>({...x,blocked:blacklistData.blockedWorkspaces.some(w=>w.id===x.id)}));hostState.blacklisted=blacklistData.blockedThreads.some(x=>x.id==='s')||blacklistData.blockedWorkspaces.length>0;hostState.eligible=!hostState.blacklisted;value={...blacklistData,affectedSessionIds:['s']};}
  if(method==='profiles')value={blacklist:blacklistData,...settings,activePriceQuote:quote,profiles:[{id:'ds',filePath:'ds.json',label:'DeepSeek'}]};
  if(method==='usage')value={process,threadAccounting,attempts:1,tokens:{input:1000,cacheRead:900,output:8},cacheHitRatio:0.9,currencies:{CNY:{exactAmount:0.01,cacheReadSavings:0.02}},usageUnknown:1};
  if(method==='configure'){settings={...settings,...payload};value=settings;}
  return {ok:true,value};
 }};
 const scope={};
 const ctx={
  connection:{rpc,generation:connection},sessions:{binding:()=>({ctx:scope,session:sessionSource})},
  conversation:{input:{for:()=>({state:inputSource})}},
  locale:{register:()=>()=>{},bind:()=>key=>localeChoice?(require('../src/client/locales.cjs')[localeChoice][key]??key):key,subscribe:fn=>{localeListeners.add(fn);return()=>localeListeners.delete(fn)}},
  inject(_deps,run){return run()},contextMenus:{register(entry){menuContributions.push(entry);return()=>{}}},
  effect(create){const dispose=create();effects.push(dispose);return dispose;},
  slots:{inject(_name,create){effects.push(create());},register(options,Component){const row={options,Component};registrations.push(row);return()=>{const i=registrations.indexOf(row);if(i>=0)registrations.splice(i,1)};}}
 };
 const primitives={Button:({variant,size,...props})=>React.createElement('button',props),Input:React.forwardRef((props,ref)=>React.createElement('input',{...props,ref})),Checkbox:({checked,label,disabled,onChange,className})=>React.createElement('label',{className},React.createElement('input',{type:'checkbox',checked,disabled,onChange:e=>onChange(e.target.checked)}),label),MenuItemButton:({onSelect,...props})=>React.createElement('button',{...props,role:'menuitem',onClick:onSelect}),Switch:({checked,label,disabled,onChange})=>React.createElement('button',{role:'switch','aria-label':label,'aria-checked':checked,disabled,onClick:()=>onChange(!checked)})};
 let plugin;
 const out=new URL('../../.qa/client-fixture.js',import.meta.url).pathname;
 await buildClient({out});
 window.__ModuleLoader__={load:({factory})=>{plugin=factory(name=>name==='react'?React:name==='@deepseek-ai/dsh-client-ui-primitives'?primitives:(()=>{throw Error(name);})());}};
 vm.runInNewContext(await readFile(out,'utf8'),{window,document,console,AbortController,AbortSignal,setTimeout,clearTimeout,TextEncoder,crypto:globalThis.crypto});
 plugin.apply(ctx);
 const overlay=registrations.find(r=>r.options.name==='conversation.input.overlay');
 const recoveryEntry=registrations.find(r=>r.options.name==='conversation.composer.dock');
 const recoveryProps=bindHooks(recoveryEntry.options.inject('s'));
 const costsEntry=registrations.find(r=>r.options.name==='conversation.view'&&r.options.id==='prediction-costs');
 const costsProps=costsEntry?bindHooks(costsEntry.options.inject('s')):null;
 const settingsEntry=registrations.find(r=>r.options.name==='settings.section'&&r.options.id==='composer-prediction');
 function bindHooks(injected){
  const result={...injected};
  for(const [name,source] of Object.entries(injected.hooks??{}))result['use'+name[0].toUpperCase()+name.slice(1)]=selector=>selector(React.useSyncExternalStore(source.subscribe,source.getSnapshot,source.getSnapshot));
  delete result.hooks;return result;
 }
 const t=key=>key;
 const actions={captureInsertion:()=>({start:0,end:0,draftRev:inputSource.getSnapshot().draftRev}),
  insertText(text,span){
   if(span.draftRev!==inputSource.getSnapshot().draftRev)return false;
   const editor=document.querySelector('[data-composer-input]');if(!editor.firstElementChild)editor.append(document.createElement('p'));editor.firstElementChild.textContent=text;
   inputSource.publish({...input(),draft:text,draftRev:2});return true;
  },persistDraft(){calls.push({method:'persist'});}};
 const common={sessionId:'s',useInput:selector=>selector(React.useSyncExternalStore(inputSource.subscribe,inputSource.getSnapshot)),
  useSession:selector=>selector(React.useSyncExternalStore(sessionSource.subscribe,sessionSource.getSnapshot)),inputActions:actions,t};
 const injected=bindHooks(overlay.options.inject('s'));
 const settingsProps=bindHooks(settingsEntry.options.inject());
 const menuEntry=registrations.find(r=>r.options.name==='sidebar.workspaces.session.menu.item'),menuProps=menuEntry?.options.inject();
 const blacklistMenu=registrations.find(r=>r.options.id==='composer-prediction-blacklist'),blacklistProps=bindHooks(blacklistMenu.options.inject());
 function App(){return React.createElement(React.Fragment,null,
  showComposer&&React.createElement('div',{'data-composer-card':''},
   React.createElement('div',{'data-composer-overlay':''},React.createElement(overlay.Component,{...common,...injected})),
   React.createElement('div',{'data-composer-input':'',contentEditable:true,role:'textbox',suppressContentEditableWarning:true},emptyRoot?null:React.createElement('p',null,React.createElement('br'))),
   React.createElement('div',{'data-composer-placeholder':''},'Ask something')),
  showComposer&&React.createElement(recoveryEntry.Component,{...common,...recoveryProps}),
  showCosts&&costsEntry?React.createElement('main',{'data-cost-view-fixture':''},React.createElement(costsEntry.Component,{...costsProps,t})):null,
  React.createElement(settingsEntry.Component,{...settingsProps,t}),showMenu?React.createElement(menuEntry.Component,{...menuProps,sessionId:'s',useMenuOpenState:()=>[true,()=>calls.push({method:'menuClose'})],t}):null,showMenu?React.createElement(blacklistMenu.Component,{...blacklistProps,sessionId:'s',displayTitle:'Fixture title',useMenuOpenState:()=>[true,()=>{}],t}):null);}
 const root=createRoot(document.querySelector('#root'));
 await act(async()=>root.render(strict?React.createElement(React.StrictMode,null,React.createElement(App)):React.createElement(App)));await flush();
 return {window,document,calls,hostState,menuContributions,async setLocale(value){localeChoice=value;await act(async()=>{for(const fn of localeListeners)fn()});await flush();},async setFocus(value){focus=value;await act(async()=>window.dispatchEvent(new window.Event(value?'focus':'blur')));await flush();},async pulse(){await act(async()=>window.dispatchEvent(new window.Event('focus')));await flush();},inputSource,sessionSource,registrations,async close(){await act(async()=>root.unmount());for(const off of effects.reverse())if(typeof off==='function')await off();dom.window.close();}};
}
test('built lazy-CJS client renders actual React overlay/settings and inserts only editable drafts',async()=>{
 const f=await fixture();
 try {
  assert.equal(f.document.querySelector('[data-dsh-prediction-visible]')?.textContent,'Continue with the tests');
  assert.equal(f.document.querySelector('select').value,'parent');
  assert.ok(f.document.querySelector('.cp-card-note').textContent.includes('parentQuoteHelp'));
  const editor=f.document.querySelector('[data-composer-input]');
  const menu=f.document.createElement('div');menu.setAttribute('role','listbox');editor.closest('[data-composer-card]').append(menu);
  let event=new f.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});
  await act(async()=>editor.dispatchEvent(event));assert.equal(f.inputSource.getSnapshot().draft,'');assert.equal(event.defaultPrevented,false);menu.remove();
  event=new f.window.KeyboardEvent('keydown',{key:'Tab',ctrlKey:true,bubbles:true,cancelable:true});
  await act(async()=>editor.dispatchEvent(event));assert.equal(f.inputSource.getSnapshot().draft,'');assert.equal(event.defaultPrevented,false);
  event=new f.window.KeyboardEvent('keydown',{key:'Enter',keyCode:229,bubbles:true,cancelable:true});
  await act(async()=>editor.dispatchEvent(event));assert.equal(f.inputSource.getSnapshot().draft,'');
  event=new f.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});
  await act(async()=>editor.dispatchEvent(event));await flush();
  assert.equal(event.defaultPrevented,true);assert.equal(f.inputSource.getSnapshot().draft,'Continue with the tests');
  assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);
  assert.equal(f.calls.filter(call=>['send','submit','prompt'].includes(call.method)).length,0);
 }finally{await f.close();}
});
test('built client switches backend files, toggles enabled and reloads without exposing secrets',async()=>{
 const f=await fixture();
 try {
  const select=f.document.querySelector('select');select.value='ds.json';
  await act(async()=>select.dispatchEvent(new f.window.Event('change',{bubbles:true})));await flush();
  assert.ok(f.calls.some(call=>call.method==='configure'&&call.payload.profileFile==='ds.json'));
  const toggle=f.document.querySelector('[role="switch"]');
  await act(async()=>toggle.click());await flush();
  assert.ok(f.calls.some(call=>call.method==='configure'&&call.payload.enabled===false));
  const reload=[...f.document.querySelectorAll('button')].find(button=>button.textContent==='reload');
  await act(async()=>reload.click());await flush();
  assert.ok(f.calls.some(call=>call.method==='configure'&&call.payload.reloadProfile===true));
  assert.ok(f.document.querySelector('[data-dsh-prediction-usage]').textContent.includes('CNY'));
 }finally{await f.close();}
 assert.equal(f.document.querySelector('[data-dsh-prediction-style]'),null);
});

test('price quote shows server rates, source date and conservative calendar uncertainty',async()=>{
 const priced={status:'priced',versionId:'flash-v1',currency:'CNY',period:'peak',certainty:'exact',
   rates:{input:2,cacheRead:0.04,output:4},checkedAt:'2026-11-12T00:00:00.000Z',calendarCoverageKnown:true};
 let f=await fixture({quote:priced,profileFile:'ds.json'});
 try {
   const text=f.document.querySelector('[data-dsh-prediction-quote]').textContent;
   assert.ok(text.includes('flash-v1'));assert.ok(text.includes('2 CNY / 1M'));assert.ok(text.includes('0.04 CNY / 1M'));
   assert.ok(text.includes(priced.checkedAt));assert.equal(f.document.querySelector('[data-dsh-prediction-quote-upper]'),null);
 }finally{await f.close();}
 f=await fixture({quote:{...priced,certainty:'upper-bound',calendarCoverageKnown:false},profileFile:'ds.json'});
 try{assert.ok(f.document.querySelector('[data-dsh-prediction-quote-upper]').textContent.includes('quoteUpperBound'));}
 finally{await f.close();}
});

test('failed predictions expose a manual retry button without auto-submit or repeated auto requests',async()=>{
 const f=await fixture({sample:(_payload,n)=>n===1?{suggestion:null,canRetry:true,reason:'HTTP_503'}:{suggestion:'Retry the tests',canRetry:false}});
 try{
  assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);
  const retry=f.document.querySelector('[data-dsh-prediction-recovery] button');assert(retry);
  assert.equal(f.calls.filter(c=>c.method==='sample').length,1);
  await act(async()=>retry.click());await flush();
  assert.equal(f.calls.filter(c=>c.method==='sample').length,2);assert.equal(f.calls.filter(c=>c.method==='sample')[1].payload.trigger,'manual_retry');
  assert(f.document.querySelector('[data-dsh-prediction-visible]'));assert.equal(f.inputSource.getSnapshot().draft,'');assert.equal(f.calls.some(c=>c.method==='submit'),false);
 }finally{await f.close()}
});
test('local-policy controls and instruction editor exist and automatic retry can be disabled',async()=>{
 const f=await fixture();
 try{
  const maximum=f.document.querySelector('input[aria-label="maxTokens"]');assert.equal(maximum.value,'999');
  assert(f.document.querySelector('select[aria-label="lengthMode"]'));assert(f.document.querySelector('textarea[aria-label="extraInstructions"]'));
  const auto=f.document.querySelector('[role=switch][aria-label=automaticRetry]');
  assert.equal(auto.getAttribute('aria-checked'),'true');await act(async()=>auto.click());await flush();
  assert(f.calls.some(c=>c.method==='configure'&&c.payload.automaticRetry===false));
 }finally{await f.close()}
});

test('thread dock shows prediction divided by combined money and never invents a percentage for unknown usage',async()=>{
 const threadAccounting={currencies:{CNY:{main:8,prediction:2,total:10,predictionShare:.2}},incompleteAttempts:0,historyAvailable:true};
 let f=await fixture({threadAccounting,showCosts:true});
 try{const text=f.document.querySelector('[data-dsh-thread-cost]').textContent;assert(text.includes('20.00%'));assert(text.includes('8.000000'));assert(text.includes('10.000000'));assert(f.calls.some(c=>c.method==='usage'&&c.payload.sessionId==='s'))}finally{await f.close()}
 f=await fixture({showCosts:true,threadAccounting:{...threadAccounting,incompleteAttempts:1,currencies:{CNY:{main:8,prediction:2,total:10,predictionShare:null}}}});
 try{assert(f.document.querySelector('[data-dsh-thread-cost]').textContent.includes('shareUnknown'));assert(!f.document.querySelector('[data-dsh-thread-cost]').textContent.includes('20.00%'))}finally{await f.close()}
});

test('accounting is a native conversation tab and never rendered below the composer',async()=>{
 const f=await fixture({threadAccounting:{currencies:{},incompleteAttempts:0}});
 try{
  const entry=f.registrations.find(r=>r.options.name==='conversation.view'&&r.options.id==='prediction-costs');
  assert(entry);assert.equal(entry.options.label(),'costTabTitle');assert.equal(entry.options.order,20);
  assert.equal(f.document.querySelector('[data-dsh-thread-cost]'),null);
  assert.equal(f.calls.filter(c=>c.method==='usage'&&c.payload.sessionId==='s').length,0);
 }finally{await f.close()}
});

test('desktop rc1 empty Lexical root generates and Tab accepts a draft without submitting',async()=>{
 const f=await fixture({emptyRoot:true});
 try {
  const editor=f.document.querySelector('[data-composer-input]');
  assert.equal(editor.children.length,0);
  assert.ok(f.document.querySelector('[data-dsh-prediction-visible]'));
  const event=new f.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});
  // Native insertion creates the paragraph as needed, like Lexical's update.
  editor.append(f.document.createElement('p'));
  await act(async()=>editor.dispatchEvent(event));await flush();
  assert.equal(event.defaultPrevented,true);
  assert.equal(f.inputSource.getSnapshot().draft,'Continue with the tests');
  assert.equal(f.calls.filter(c=>['send','submit','prompt'].includes(c.method)).length,0);
 }finally{await f.close();}
});

test('native placeholder is replaced while a suggestion is visible and restored on typing and unload',async()=>{
 const f=await fixture();
 const host=f.document.querySelector('[data-composer-placeholder]');
 try{
  assert.equal(host.style.getPropertyValue('visibility'),'hidden');
  assert.ok(host.getAttribute('data-dsh-prediction-owner'));
  await act(async()=>f.inputSource.publish({...input(),draft:'My own message',draftRev:2}));await flush();
  assert.equal(host.style.getPropertyValue('visibility'),'');
  assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);
  await act(async()=>f.inputSource.publish({...input(),draftRev:3}));await flush();
  assert.ok(f.document.querySelector('[data-dsh-prediction-visible]'));
  assert.equal(f.calls.filter(x=>x.method==='sample').length,1);
 }finally{await f.close();}
 assert.equal(host.style.getPropertyValue('visibility'),'');
});
test('host replacement of its placeholder node transfers the decoration lease cleanly',async()=>{
 const f=await fixture();
 let replacement;
 try{
  const old=f.document.querySelector('[data-composer-placeholder]');replacement=old.cloneNode(true);replacement.removeAttribute('data-dsh-prediction-owner');replacement.style.removeProperty('visibility');
  await act(async()=>old.replaceWith(replacement));await flush();
  assert.equal(old.style.getPropertyValue('visibility'),'');
  assert.equal(replacement.style.getPropertyValue('visibility'),'hidden');
  assert.equal(f.calls.filter(x=>x.method==='sample').length,1);
 }finally{await f.close();}
 assert.equal(replacement.style.getPropertyValue('visibility'),'');
});
test('OS focus changes do not define logical activity or purchase a replacement',async()=>{
 const f=await fixture({focus:false});
 try{
  assert.equal(f.calls.filter(x=>x.method==='sample').length,1);
  assert.ok(f.document.querySelector('[data-dsh-prediction-visible]'));
  await f.setFocus(true);await f.setFocus(false);await f.setFocus(true);
  assert.ok(f.document.querySelector('[data-dsh-prediction-visible]'));
  assert.equal(f.calls.filter(x=>x.method==='sample').length,1);
 }finally{await f.close();}
});
test('a late response from the previous completed bubble cannot replace the new bubble prediction',async()=>{
 let settle;const old=new Promise(resolve=>settle=resolve),hostState={revision:'old'};
 const f=await fixture({hostState,sample:(_p,n)=>n===1?old:{suggestion:'For the new response',revision:'new'}});
 try{
  hostState.revision='new';hostState.expectedTurnId=2;
  await act(async()=>f.sessionSource.publish({...session(),running:true}));
  await act(async()=>f.sessionSource.publish(session()));await flush();
  assert.equal(f.calls.filter(c=>c.method==='sample').length,2);
  assert.match(f.document.querySelector('[data-dsh-prediction-visible]').textContent,/new response/);
  settle({suggestion:'Obsolete previous response',revision:'old'});await flush();
  assert.doesNotMatch(f.document.body.textContent,/Obsolete previous response/);
  assert.match(f.document.querySelector('[data-dsh-prediction-visible]').textContent,/new response/);
 }finally{settle?.({suggestion:'old',revision:'old'});await f.close();}
});
test('Tab validates the current source before inserting and leaves a concurrently edited draft untouched',async()=>{
 let confirm;const accepted=new Promise(resolve=>confirm=resolve);
 const f=await fixture({accept:()=>accepted});
 try{
  const editor=f.document.querySelector('[data-composer-input]'),event=new f.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});
  await act(async()=>editor.dispatchEvent(event));assert.equal(event.defaultPrevented,true);
  assert.equal(f.inputSource.getSnapshot().draft,'');
  await act(async()=>{editor.firstElementChild.textContent='User edit';f.inputSource.publish({...input(),draft:'User edit',draftRev:7})});
  confirm({valid:true});await flush();
  assert.equal(f.inputSource.getSnapshot().draft,'User edit');
  assert.equal(f.calls.filter(x=>x.method==='persist').length,0);
  assert.equal(f.calls.filter(x=>['send','submit','prompt'].includes(x.method)).length,0);
 }finally{confirm?.({valid:false});await f.close();}
});
test('a stale source rejection hides its decoration and performs no repair or generation',async()=>{
 const f=await fixture({accept:()=>({valid:false})});
 try{
  const editor=f.document.querySelector('[data-composer-input]');
  await act(async()=>editor.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true})));await flush();
  assert.equal(f.inputSource.getSnapshot().draft,'');
  assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);
  assert.equal(f.calls.filter(x=>x.method==='sample').length,1);
 }finally{await f.close();}
});
test('StrictMode effect remounts keep one observable binding and do not duplicate inference',async()=>{
 const f=await fixture({strict:true});
 try{assert.ok(f.document.querySelector('[data-dsh-prediction-visible]'));assert.equal(f.calls.filter(x=>x.method==='sample').length,1)}
 finally{await f.close();}
});
test('sidebar per-thread toggle uses the official row-menu slot without binding or predicting inactive sessions',async()=>{
 const f=await fixture({focus:false,showMenu:true,hostState:{canGenerate:false}});
 try{
  const button=f.document.querySelector('[data-dsh-thread-prediction-toggle]');
  assert.equal(button.getAttribute('role'),'menuitem');assert.match(button.textContent,/disableThreadPrediction/);
  await act(async()=>button.click());await flush();
  assert.ok(f.calls.some(x=>x.method==='setThread'&&x.payload.sessionId==='s'&&x.payload.enabled===false));
  assert.ok(f.calls.some(x=>x.method==='menuClose'));
  assert.match(button.textContent,/enableThreadPrediction/);
  assert.equal(f.calls.filter(x=>x.method==='sample').length,0);
 }finally{await f.close();}
});
test('IME, attachments, command popups and queued drafts hide predictions without purchasing replacements',async()=>{
 const f=await fixture();
 try{
  for(const patch of [{attachmentIds:['file']},{queue:[{id:'queued'}]},{phase:'claimed'}]){
   await act(async()=>f.inputSource.publish({...input(),...patch}));await flush();assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);
   await act(async()=>f.inputSource.publish(input()));await flush();
  }
  const editor=f.document.querySelector('[data-composer-input]');
  await act(async()=>editor.dispatchEvent(new f.window.CompositionEvent('compositionstart',{bubbles:true})));await flush();
  assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);
  await act(async()=>editor.dispatchEvent(new f.window.CompositionEvent('compositionend',{bubbles:true})));await flush();
  assert.equal(f.calls.filter(x=>x.method==='sample').length,1);
 }finally{await f.close();}
});


test('a month-old backend result replaces the placeholder and Tab accepts it with zero sample RPCs',async()=>{
 const f=await fixture({emptyRoot:true,hostState:{canGenerate:false,cachedResult:{status:'ready',suggestion:'Stored month-old next message',revision:'r1'},events:[{code:'retroactive-outside-window',at:1}]}});
 try{assert.ok(f.document.querySelector('[data-dsh-prediction-visible]').textContent.includes('Stored month-old next message'));
 assert.equal(f.calls.filter(c=>c.method==='sample').length,0);
 const editor=f.document.querySelector('[data-composer-input]');await act(async()=>editor.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true})));await flush();
 assert.equal(f.inputSource.getSnapshot().draft,'Stored month-old next message');assert.equal(f.calls.filter(c=>c.method==='sample').length,0);
 }finally{await f.close()}
});
test('cache-loss pause is shown in the composer and in the cost-tab process history without inference',async()=>{
 const event={id:'pause-1',code:'cache-prefix-loss',data:{retainedRatio:0.49},at:1};
 const f=await fixture({showCosts:true,hostState:{eligible:false,canGenerate:false,suspended:'cache-prefix-loss',events:[event],version:2},process:{events:[event]}});
 try{assert.ok(f.document.querySelector('[data-dsh-prediction]').textContent.includes('49.0%'));
 assert.ok(f.document.querySelector('[data-dsh-process-events]').textContent.includes('49.0%'));
 assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);assert.equal(f.calls.filter(c=>c.method==='sample').length,0);
 assert.equal(f.document.querySelector('[data-dsh-thread-cost]')?.closest('[data-cost-view-fixture]')!==null,true);
 }finally{await f.close()}
});


test('the cost view receives semantic process events even when the composer is unmounted, without polling or predicting',async()=>{
 let deliver;const process={events:[]};
 const watch=(payload,signal)=>new Promise(resolve=>{deliver=resolve;signal?.addEventListener('abort',()=>resolve(null),{once:true})});
 const f=await fixture({showComposer:false,showCosts:true,process,watch});
 try{assert.equal(f.document.querySelector('[data-composer-card]'),null);assert.equal(typeof deliver,'function');
 const event={id:'cost-event',code:'validation-repair',data:{},at:1};process.events.push(event);
 await act(async()=>deliver({version:1,event}));await flush();
 assert.ok(f.document.querySelector('[data-dsh-process-events]').textContent.includes('validation-repair'));
 assert.equal(f.calls.filter(c=>['sample','observe','state'].includes(c.method)).length,0);
 }finally{await f.close()}
});

test('event numbering follows the retained chronology and current status matches the last item',async()=>{
 const events=[{id:'early',code:'configuration-changed',at:1},{id:'late',code:'history-read-failed',at:2}];
 const f=await fixture({showComposer:false,showCosts:true,process:{events}});
 try{const section=f.document.querySelector('[data-dsh-process-events]'),items=[...section.querySelectorAll('li')];assert.equal(items.length,2);assert.match(items[0].textContent,/configuration-changed/);assert.match(items[1].textContent,/history-read-failed/);assert.equal(section.querySelector('p').textContent,items[1].textContent);}finally{await f.close()}
});
test('first-use notice acknowledges persistently and never purchases a prediction',()=>{
 const req=createRequire(import.meta.url),path=req.resolve('../src/client/onboarding.cjs');const {showFirstUseNotice,KEY}=req(path);
 const dom=new JSDOM('<body></body>',{url:'http://localhost'}),doc=dom.window.document;
 const dispose=showFirstUseNotice(doc,x=>x);showFirstUseNotice(doc,x=>x);
 assert.equal(doc.querySelectorAll('dialog').length,1);assert.match(doc.querySelector('p').textContent,/completionHelp/);
 doc.querySelector('button').click();assert.equal(doc.querySelector('dialog'),null);assert.equal(dom.window.localStorage.getItem(KEY),'acknowledged');
 dispose();delete req.cache[path];req(path).showFirstUseNotice(doc,x=>x);assert.equal(doc.querySelector('dialog'),null);dom.window.close();
});
test('native-flow preview leases only the ghost hint and leaves draft DOM and host layout intact',()=>{
 const {paint,restore,cssString}=require('../src/client/placeholder.cjs');const dom=new JSDOM('<div id="card"><div id="editor"><p><br></p></div><div data-composer-placeholder></div><div id="overlay"></div></div>'),doc=dom.window.document;
 const card=doc.querySelector('#card'),editor=doc.querySelector('#editor'),node=doc.querySelector('#overlay'),placeholder=doc.querySelector('[data-composer-placeholder]'),html=editor.innerHTML;
 const mount={card,editor,node,owner:'test'};paint(mount,true,'第一行\n第二行 "quoted" \\ path');
 assert.equal(editor.style.getPropertyValue('--dsh-composer-hint'),cssString('第一行\n第二行 "quoted" \\ path'));assert.equal(editor.innerHTML,html);assert.equal(editor.textContent,'');assert.equal(node.style.left,'');assert.equal(editor.style.minHeight,'');
 restore(mount);assert.equal(editor.style.getPropertyValue('--dsh-composer-hint'),'');assert.equal(placeholder.style.visibility,'');assert.equal(editor.innerHTML,html);dom.window.close();
});
test('a newer host command hint wins and is never overwritten or erased by prediction cleanup',()=>{
 const {paint,restore,ghostAvailable}=require('../src/client/placeholder.cjs');const dom=new JSDOM('<div id="card"><div id="editor"><p><br></p></div><div data-composer-placeholder></div><div id="overlay"></div></div>'),doc=dom.window.document;
 const mount={card:doc.querySelector('#card'),editor:doc.querySelector('#editor'),node:doc.querySelector('#overlay'),owner:'test'};
 paint(mount,true,'preview');mount.editor.style.setProperty('--dsh-composer-hint','"host command"');assert.equal(ghostAvailable(mount),false);restore(mount);assert.equal(mount.editor.style.getPropertyValue('--dsh-composer-hint'),'"host command"');assert.equal(doc.querySelector('[data-composer-placeholder]').style.visibility,'');dom.window.close();
});

test('workspace context menu targets the clicked workspace identity and persists its blacklist selection',async()=>{
 const f=await fixture({blacklistData:{workspaces:[{id:'w',title:'Work',path:'/work',blocked:false}],blockedWorkspaces:[],blockedThreads:[],workspaceLookupAvailable:true}});
 try{const entry=f.menuContributions.find(x=>x.target==='workspace');assert.ok(entry);const item=entry.resolve({workspaceId:'w',displayTitle:'Work'})[0];assert.equal(item.label,'addWorkspaceBlacklist');await act(async()=>item.run());await flush();assert.deepEqual(JSON.parse(JSON.stringify(f.calls.filter(x=>x.method==='setBlacklist').at(-1).payload)),{scope:'workspace',id:'w',blocked:true,label:'Work'});assert.equal(entry.resolve({workspaceId:'w',displayTitle:'Work'})[0].label,'removeWorkspaceBlacklist');assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);}finally{await f.close()}
});
test('thread blacklist menu hides the native decoration and removal reuses the existing cached result',async()=>{
 const f=await fixture({showMenu:true,hostState:{cachedResult:{suggestion:'Saved prediction',status:'ready'}}});
 try{assert.ok(f.document.querySelector('[data-dsh-prediction-visible]'));await act(async()=>f.document.querySelector('[data-dsh-thread-blacklist]').click());await flush();assert.equal(f.calls.filter(x=>x.method==='setBlacklist').at(-1).payload.scope,'thread');assert.equal(f.document.querySelector('[data-dsh-prediction-visible]'),null);assert.ok(f.document.querySelector('[data-dsh-prediction-blacklist]').textContent.includes('Fixture title'));await act(async()=>f.document.querySelector('[data-dsh-thread-blacklist]').click());await flush();assert.equal(f.document.querySelector('[data-dsh-prediction-visible]').textContent,'Saved prediction');assert.equal(f.calls.filter(x=>x.method==='sample').length,0);}finally{await f.close()}
});

test('settings use a dedicated native section and follow effective locale without duplicate navigation or model calls',async()=>{
 const f=await fixture({showComposer:false});try{assert.equal(f.registrations.some(r=>r.options.name==='settings.general.item'&&r.options.id==='composer-prediction'),false);await f.setLocale('zh');let entries=f.registrations.filter(r=>r.options.name==='settings.section'&&r.options.id==='composer-prediction');assert.equal(entries.length,1);assert.equal(entries[0].options.label,'下一条消息预测');await f.setLocale('en');entries=f.registrations.filter(r=>r.options.name==='settings.section'&&r.options.id==='composer-prediction');assert.equal(entries.length,1);assert.equal(entries[0].options.label,'Composer predictions');assert.equal(f.calls.filter(x=>x.method==='sample').length,0);}finally{await f.close()}
});

test('current process phase is separate from the last completion event and cannot invent a queue',async()=>{
 const f=await fixture({showComposer:false,showCosts:true,process:{phase:'no-pending-prediction',queued:false,events:[{id:'finished',code:'assistant-completed',at:1}]}});try{const section=f.document.querySelector('[data-dsh-process-events]');assert.equal(section.querySelector('p').textContent,'phase:no-pending-prediction');assert.ok(section.querySelector('li').textContent.includes('assistant-completed'));}finally{await f.close()}
});

test('reasoning selector defaults minimum and saves only explicit user changes',async()=>{
 const f=await fixture({showComposer:false});try{
 const select=f.document.querySelector('select[name="reasoningMode"]');assert.equal(select.value,'minimum');
 assert.ok(f.document.querySelector('label[for="'+select.id+'"]'));assert.ok(f.document.getElementById(select.getAttribute('aria-describedby')));
 const n=f.calls.filter(x=>x.method==='configure').length;
 await act(async()=>{select.value='configured';select.dispatchEvent(new f.window.Event('change',{bubbles:true}));});
 assert.equal(f.calls.filter(x=>x.method==='configure').length,n);
 await act(async()=>f.document.querySelector('.cp-save-bar button').click());await flush();
 assert.equal(f.calls.filter(x=>x.method==='configure').at(-1).payload.reasoningMode,'configured');
 assert.equal(select.value,'configured');assert.equal(f.calls.filter(x=>x.method==='sample').length,0);
 }finally{await f.close()}
});
