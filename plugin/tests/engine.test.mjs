
import test from 'node:test';
import assert from 'node:assert/strict';
import {PredictionEngine,parseSuggestion,acceptKey,wrapPrompt} from '../src/core/engine.mjs';
function fixture(run=async()=>({text:'{"suggestion":"继续"}'})) {
 const entries=[],pending=[];
 const ledger={begin:async x=>pending.push(x),record:async x=>entries.push(x),close:async()=>{}};
 const profiles={current:()=>null,publicCurrent:()=>null};
 const e=new PredictionEngine({profiles,ledger,parentRun:run,config:{enabled:true}});
 e.capture({sessionId:'s',turnId:1,revision:'r',options:{provider:'p',model:'m',messages:[{role:'user',content:'你好'}]}});
 return {e,entries,pending};
}
test('tail prompt wrapper and strict suggestion parser',()=>{
 assert.match(wrapPrompt('P'),/^P\n\nReturn only JSON/);
 assert.equal(parseSuggestion('{"suggestion":" 继续 "}'),'继续');
 assert.equal(parseSuggestion('{"suggestion":null}'),null);
 assert.equal(parseSuggestion('{"suggestion":"ok","other":1}'),'ok');
 assert.throws(()=>parseSuggestion('x'.repeat(65537)));
});
test('editable draft key guards',()=>{
 for(const key of ['Tab','Enter','ArrowRight'])assert.equal(acceptKey({key},{draft:''}),true);
 for(const event of [{key:'Tab',isComposing:true},{key:'Tab',keyCode:229},{key:'Enter',shiftKey:true}])assert.equal(acceptKey(event,{draft:''}),false);
 assert.equal(acceptKey({key:'Tab'},{draft:'x'}),false);
 assert.equal(acceptKey({key:'Tab'},{draft:''},{menuOpen:true}),false);
});
test('deduplicates in flight and successful per-turn result',async()=>{
 let resolve,calls=0;const {e,entries}=fixture(async()=>{calls++;return await new Promise(r=>resolve=r)});
 const a=e.sample({sessionId:'s',expectedTurnId:1}),b=e.sample({sessionId:'s',expectedTurnId:1});
 await new Promise(r=>setImmediate(r));resolve({text:'{"suggestion":"继续"}'});assert.equal((await a).suggestion,'继续');await b;
 await e.sample({sessionId:'s',expectedTurnId:1});assert.equal(calls,1);assert.equal(entries.length,1);await e.dispose();
});
test('late completion after parent change is never shown',async()=>{
 let resolve;const {e,entries}=fixture(async()=>await new Promise(r=>resolve=r));
 const p=e.sample({sessionId:'s',expectedTurnId:1});await new Promise(r=>setImmediate(r));
 e.capture({sessionId:'s',turnId:2,options:{model:'m',messages:[]}});resolve({text:'{"suggestion":"stale"}'});
 assert.equal((await p).suggestion,null);assert.equal(entries[0].status,'cancelled');await e.dispose();
});
test('configuration change cancels and clears sample',async()=>{
 let resolve;const {e}=fixture(async()=>await new Promise(r=>resolve=r));
 const p=e.sample({sessionId:'s',expectedTurnId:1});await new Promise(r=>setImmediate(r));
 e.configure({prompt:'new'});resolve({text:'{"suggestion":"old"}'});assert.equal((await p).suggestion,null);await e.dispose();
});
test('tool calls and malformed JSON suppressed with ledger evidence',async()=>{
 for(const result of [{text:'{"suggestion":"x"}',toolCalled:true},{text:'invalid'}]){
 const {e,entries,pending}=fixture(async()=>result);e.configure({automaticRetry:false});assert.equal((await e.sample({sessionId:'s',expectedTurnId:1})).suggestion,null);assert.equal(entries.length,1);assert.equal(pending.length,1);assert.equal(entries[0].status,'failed');await e.dispose()
 }
});
test('stale expected turn and disabled cause no physical request',async()=>{
 let calls=0;const {e,entries}=fixture(async()=>{calls++;return {}});
 await e.sample({sessionId:'s',expectedTurnId:0});e.configure({enabled:false});await e.sample({sessionId:'s',expectedTurnId:1});assert.equal(calls,0);assert.equal(entries.length,0);await e.dispose();
});
