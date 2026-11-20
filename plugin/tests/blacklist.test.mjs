import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PredictionBlacklist} from '../src/core/blacklist.mjs';
import {validatePayload} from '../src/client/host-rpc.mjs';
import {mountHost,completedSession,source} from './support/mount-host.mjs';
const req=(id)=>({sessionId:id,expectedTurnId:1,trigger:'catch_up'});
async function registry(h,rows){class Registry extends source.Service{constructor(ctx){super(ctx,'workspaceRegistry')}list(){return rows}}await h.ctx.plugin(Registry)}
test('stable workspace identity, thread scope and persistence survive rename and changed membership',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'prediction-blacklist-'));try{
 const rows=[{id:'w1',title:'same',path:'/one',sessionIds:['a']},{id:'w2',title:'same',path:'/one-other',sessionIds:['b']}];
 let x=new PredictionBlacklist({directory,listWorkspaces:()=>rows});x.set({scope:'workspace',id:'w1',blocked:true,label:'same'});
 assert.equal(x.evaluate('a').blacklisted,true);assert.equal(x.evaluate('b').blacklisted,false);rows[0].title='renamed';rows[0].path='/changed';assert.equal(x.evaluate('a').blacklisted,true);
 rows[0].sessionIds.push('future');assert.equal(x.evaluate('future').blacklisted,true);x.set({scope:'thread',id:'b',blocked:true,label:'b'});
 x=new PredictionBlacklist({directory,listWorkspaces:()=>rows});assert.equal(x.evaluate('a').blacklistReason,'workspace-blacklisted');assert.equal(x.evaluate('b').blacklistReason,'thread-blacklisted');
 x.set({scope:'workspace',id:'w1',blocked:false});assert.equal(x.evaluate('a').blacklisted,false);assert.equal(x.evaluate('b').blacklisted,true);
 x.set({scope:'thread',id:'__proto__',blocked:true});assert.equal(x.evaluate('__proto__').blacklisted,true);assert.throws(()=>x.set({scope:'workspace',id:'missing',blocked:true}));
 }finally{await rm(directory,{recursive:true,force:true})}
});
test('a configured workspace blacklist fails closed when authoritative membership is unavailable',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'prediction-blacklist-'));try{let ready=true;const x=new PredictionBlacklist({directory,listWorkspaces:()=>{if(!ready)throw Error();return [{id:'w',sessionIds:['a']}]}});assert.equal(x.evaluate('b').blacklisted,false);x.set({scope:'workspace',id:'w',blocked:true});ready=false;assert.equal(x.evaluate('a').blacklistReason,'blacklist-unavailable');assert.equal(x.evaluate('b').blacklistReason,'blacklist-unavailable');x.set({scope:'workspace',id:'w',blocked:false});assert.equal(x.evaluate('b').blacklisted,false)}finally{await rm(directory,{recursive:true,force:true})}
});
test('owner RPC validates blacklist scope, control characters, boolean and bounded labels',()=>{
 assert.deepEqual(validatePayload('setBlacklist',{scope:'thread',id:'a',blocked:true}),{scope:'thread',id:'a',blocked:true});
 for(const p of [{scope:'path',id:'a',blocked:true},{scope:'workspace',id:'a',blocked:'true'},{scope:'thread',id:'a\n',blocked:true},{scope:'thread',id:'a',blocked:true,label:'x'.repeat(201)}])assert.throws(()=>validatePayload('setBlacklist',p));
});
test('native Host blocks workspace members before dispatch, manual retry, source accept and future loops',async t=>{
 const h=await mountHost(t),rows=[{id:'w',title:'Workspace',path:'/work',sessionIds:['a','future']}];await registry(h,rows);await completedSession(h,{id:'a'});await completedSession(h,{id:'b'});
 h.controller.setBlacklist({scope:'workspace',id:'w',blocked:true});
 assert.equal(h.controller.state('a').eligible,false);assert.equal(h.controller.state('a').blacklistReason,'workspace-blacklisted');
 for(const trigger of ['live','catch_up','manual_retry'])assert.equal((await h.controller.sample({...req('a'),trigger})).suggestion,null);
 assert.equal((await h.controller.accept({sessionId:'a',expectedTurnId:1,expectedRevision:'0'.repeat(64),expectedConfigVersion:h.controller.engine.epoch})).valid,false);assert.equal(h.adapter.calls.length,0);
 h.controller.setThread({sessionId:'a',enabled:true});assert.equal(h.controller.state('a').blacklisted,true);
 await completedSession(h,{id:'future'});assert.equal(h.controller.lifecycle.canGenerate('future'),false);
 assert.ok((await h.controller.sample(req('b'))).suggestion);assert.equal(h.adapter.calls.length,1);
 h.controller.setBlacklist({scope:'workspace',id:'w',blocked:false});assert.equal(h.controller.lifecycle.canGenerate('future'),false,'unblock does not purchase missing results immediately');
 h.controller.userSent('future',{id:'new-submission'});h.controller.lifecycle.completed('future',{normal:true});assert.equal(h.controller.lifecycle.canGenerate('future'),true);
});
test('blacklisted threads are removed before backfill top-three selection',async t=>{
 const h=await mountHost(t);for(const id of ['a','b','c','d'])await completedSession(h,{id});
 h.controller.setBlacklist({scope:'thread',id:'a',blocked:true});
 const now=h.controller.lifecycle.now(),selected=h.controller.lifecycle.selectRetrospective(['a','b','c','d'].map((sessionId,i)=>({sessionId,lastUserSentAt:now-i*10,normal:true})));
 assert.deepEqual(selected.map(x=>x.sessionId),['b','c','d']);assert.equal(h.adapter.calls.length,0);
});
test('blocking a native in-flight request aborts it and rejects a late provider result without another dispatch',async t=>{
 const h=await mountHost(t);await completedSession(h,{id:'a'});let release,started;const begun=new Promise(r=>started=r);h.adapter.delay=()=>{started();return new Promise(r=>release=r)};
 const pending=h.controller.sample(req('a'));await begun;const job=h.controller.engine.jobs.get('a');h.controller.setBlacklist({scope:'thread',id:'a',blocked:true,label:'A'});
 assert.equal(job.controller.signal.aborted,true);release();const result=await pending;assert.equal(result.suggestion,null);assert.equal(h.adapter.calls.length,1);assert.equal(h.controller.state('a').cachedResult,undefined);
 h.controller.setBlacklist({scope:'thread',id:'a',blocked:false});assert.equal(h.controller.lifecycle.canGenerate('a'),false);
});
test('blocking and unblocking preserves a persisted valid result with no second provider request',async t=>{
 const h=await mountHost(t);await completedSession(h,{id:'a'});const first=await h.controller.sample(req('a'));assert.ok(first.suggestion);
 h.controller.setBlacklist({scope:'thread',id:'a',blocked:true});assert.equal(h.controller.state('a').cachedResult,undefined);
 h.controller.setBlacklist({scope:'thread',id:'a',blocked:false});assert.equal((await h.controller.sample(req('a'))).suggestion,first.suggestion);assert.equal(h.adapter.calls.length,1);
});
