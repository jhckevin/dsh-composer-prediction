import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createRpcHandler,validatePayload} from '../src/client/host-rpc.mjs';
const require=createRequire(import.meta.url);
const {inputEligible,sessionEligible,acceptanceKey,emptyParagraph}=require('../src/client/guards.cjs');
const {PredictionClient,observable}=require('../src/client/controller.cjs');
const input=()=>({phase:'plain',draft:'',draftRev:1,attachmentIds:[],occurrences:[],queue:[]});
const session=()=>({openState:'open',running:false,removed:false,blank:false,awaitingFirstTurn:false,loadingOlder:false,pendingSubmissions:[],subagent:null});
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
test('acceptance guards preserve modifiers, IME, menus and nonempty drafts',()=>{
 const event={key:'Tab'};assert.equal(acceptanceKey(event),true);
 for(const key of ['altKey','ctrlKey','metaKey','shiftKey','isComposing','defaultPrevented'])assert.equal(acceptanceKey({...event,[key]:true}),false,key);
 assert.equal(acceptanceKey({...event,keyCode:229}),false);assert.equal(acceptanceKey({key:'Escape'}),false);
 for(const key of ['ArrowRight','Enter'])assert.equal(acceptanceKey({key}),true);
 assert.equal(inputEligible(input()),true);
 for(const patch of [{draft:' '},{attachmentIds:['x']},{phase:'claimed'},{queue:[1]},{occurrences:[1]}])assert.equal(inputEligible({...input(),...patch}),false);
 assert.equal(sessionEligible(session()),true);
 for(const patch of [{running:true},{loadingOlder:true},{openState:'loading'},{subagent:{}},{blank:true}])assert.equal(sessionEligible({...session(),...patch}),false);
});
test('empty document requires a single editable empty paragraph',()=>{
 const attributes=new Map(),styles=new Map();
 const editor={style:{getPropertyValue:k=>styles.get(k)?.value??'',getPropertyPriority:k=>styles.get(k)?.priority??'',setProperty:(k,value,priority='')=>styles.set(k,{value,priority}),removeProperty:k=>styles.delete(k)},setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k),children:[{tagName:'P',textContent:'',querySelector:()=>null}],getAttribute:k=>k==='contenteditable'?'true':null};
 assert.equal(emptyParagraph(editor),true);
 editor.children.push(editor.children[0]);assert.equal(emptyParagraph(editor),false);
});
test('RPC is owner-only, validates payload and passes cancellation without exposing errors',async()=>{
 const calls=[];
 const handler=createRpcHandler({sample:(payload,options)=>{calls.push([payload,options]);return {suggestion:'Continue'};}});
 const signal=new AbortController().signal,owner={principal:{kind:'owner'},signal};
 assert.equal((await handler('sample',{sessionId:'s',expectedTurnId:1,trigger:'live'},signal,{principal:{kind:'agent'},signal})).ok,false);
 assert.equal(calls.length,0);
 assert.equal((await handler('sample',{sessionId:'s',expectedTurnId:1,trigger:'live'},signal,owner)).ok,true);
 assert.ok(calls[0][1].signal instanceof AbortSignal);
 assert.throws(()=>validatePayload('sample',{sessionId:'s',expectedTurnId:1,trigger:'live',credential:'secret'}));
 assert.throws(()=>validatePayload('configure',{prompt:'中'.repeat(1400)}));
 const failed=createRpcHandler({state:()=>{throw new Error('sk-secret-cannot-escape');}});
 assert.equal(JSON.stringify(await failed('state',{sessionId:'s'},signal,owner)).includes('sk-secret'),false);
});
function fixture({sample}={}) {
 const inputSource=observable(input()),sessionSource=observable(session());
 const events=new Map(),editorEvents=new Map(),calls=[];
 const document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};
 const attributes=new Map(),styles=new Map();
 const editor={style:{getPropertyValue:k=>styles.get(k)?.value??'',getPropertyPriority:k=>styles.get(k)?.priority??'',setProperty:(k,value,priority='')=>styles.set(k,{value,priority}),removeProperty:k=>styles.delete(k)},setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k),children:[{tagName:'P',textContent:'',querySelector:()=>null}],hasAttribute:()=>false,
  getAttribute:key=>key==='contenteditable'?'true':attributes.get(key)??null,addEventListener:(type,fn)=>editorEvents.set(type,fn),removeEventListener:type=>editorEvents.delete(type),focus(){}};
 const card={querySelector:selector=>selector.includes('contenteditable')?editor:null,contains:target=>target===editor,
 addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type)};
 const node={closest:()=>card};
 const actions={captureInsertion:()=>({start:0,end:0,draftRev:inputSource.getSnapshot().draftRev}),
 insertText(text,span){if(inputSource.getSnapshot().draftRev!==span.draftRev)return false;inputSource.publish({...input(),draft:text,draftRev:2});return true;},persistDraft(){calls.push({method:'persist'});}};
 const connection={generation:observable({id:1})};
 const rpc={async call(_channel,method,payload,signal){
  calls.push({method,payload,signal});let value;
  if(method==='state'||method==='observe')value={enabled:true,eligible:true,expectedTurnId:1,revision:'r1',configVersion:1};
  if(method==='accept')value={valid:true};
  if(method==='sample')value=sample?await sample(payload,signal):{suggestion:'Continue'};
  return {ok:true,value};
 }};
 const client=new PredictionClient({rpc,connection,document,
 sessions:{binding:()=>({ctx:{},session:sessionSource})},conversation:{input:{for:()=>({state:inputSource})}}});
 const dispose=client.bind('s',node,actions);
 return {client,inputSource,sessionSource,events,editor,actions,calls,dispose};
}
test('one request per exact source turn; acceptance inserts draft without sending',async()=>{
 const f=fixture();await tick();await tick();
 assert.equal(f.calls.filter(x=>x.method==='sample').length,1);
 assert.equal(f.client.sourceFor('s').getSnapshot().suggestion,'Continue');
 let prevented=false,stopped=false;
 f.events.get('keydown')({target:f.editor,key:'Tab',preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});await tick();await tick();
 assert.equal(f.inputSource.getSnapshot().draft,'Continue');assert.ok(prevented&&stopped);
 assert.equal(f.calls.filter(x=>['submit','prompt','send'].includes(x.method)).length,0);
 assert.ok(f.calls.some(x=>x.method==='persist'));f.dispose();f.client.close();
});
test('editing cancels an inflight sample and late results never replace the draft',async()=>{
 let settle;const deferred=new Promise(resolve=>{settle=resolve;});
 const f=fixture({sample:()=>deferred});await tick();
 f.inputSource.publish({...input(),draft:'My message',draftRev:2});
 settle({suggestion:'Late suggestion'});await tick();await tick();
 assert.equal(f.client.sourceFor('s').getSnapshot().suggestion,null);
 assert.equal(f.inputSource.getSnapshot().draft,'My message');
 assert.ok(f.calls.find(x=>x.method==='sample').signal.aborted);
 f.dispose();f.client.close();
});
test('running completion emits live; reopening idle starts catch_up',async()=>{
 const f=fixture();await tick();await tick();
 assert.equal(f.calls.find(x=>x.method==='sample').payload.trigger,'catch_up');
 f.sessionSource.publish({...session(),running:true});
 // Next turn identity comes from host; allow a new source key in this fixture.
 f.client.entries.get('s').lastAttempt=null;
 f.sessionSource.publish(session());await tick();await tick();
 assert.equal(f.calls.filter(x=>x.method==='sample').at(-1).payload.trigger,'live');
 f.dispose();f.client.close();assert.equal(f.events.size,0);
});

test('empty root contract rejects bare text and disabled editors',()=>{
 const editor={children:[],textContent:'',getAttribute:k=>k==='contenteditable'?'true':null};
 assert.equal(emptyParagraph(editor),true);
 editor.textContent='typed';assert.equal(emptyParagraph(editor),false);
 editor.textContent='';editor.getAttribute=k=>k==='contenteditable'?'false':null;assert.equal(emptyParagraph(editor),false);
});
test('Tab while loading keeps focus and deduplicates sampling; other keys are untouched',async()=>{
 let settle;const deferred=new Promise(r=>settle=r);const f=fixture({sample:()=>deferred});await tick();
 let prevented=0;
 f.events.get('keydown')({target:f.editor,key:'Tab',preventDefault(){prevented++;},stopPropagation(){}});
 f.events.get('keydown')({target:f.editor,key:'Enter',preventDefault(){prevented++;},stopPropagation(){}});
 assert.equal(prevented,1);assert.equal(f.calls.filter(c=>c.method==='sample').length,1);
 settle({suggestion:'Continue'});await tick();f.dispose();f.client.close();
});

test('Tab reopens the same-turn result via the server cache after draft acceptance, without auto-send',async()=>{
 const f=fixture();await tick();await tick();
 f.events.get('keydown')({target:f.editor,key:'Tab',preventDefault(){},stopPropagation(){}});await tick();await tick();
 f.inputSource.publish({...input(),draftRev:3});await tick();
 assert.equal(f.client.sourceFor('s').getSnapshot().suggestion,null);
 f.events.get('keydown')({target:f.editor,key:'Tab',preventDefault(){},stopPropagation(){}});
 await tick();await tick();
 assert.equal(f.client.sourceFor('s').getSnapshot().suggestion,'Continue');
 assert.equal(f.calls.filter(c=>c.method==='sample').length,2);
 assert.equal(f.calls.filter(c=>['send','submit','prompt'].includes(c.method)).length,0);
 f.dispose();f.client.close();
});
