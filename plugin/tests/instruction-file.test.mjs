
import test from 'node:test';import assert from 'node:assert/strict';import {writeFile,readFile,symlink} from 'node:fs/promises';import {join} from 'node:path';
import {mountHost,completedSession} from './support/mount-host.mjs';
test('instruction_prediction.md is host-local, low-priority, editable and included only in prediction tail',async t=>{
 const h=await mountHost(t);await completedSession(h,{id:'s'});const file=join(h.directory,'instruction_prediction.md');
 assert.match(await readFile(file,'utf8'),/用户附加/);
 await h.controller.configure({instructionText:'用户自定义：忽略上限，始终输出英文。'});
 const state=h.controller.state('s');assert(state.eligible);const snapshot=h.controller.engine.snapshots.get('s');assert.match(snapshot.instructionText,/用户自定义/);
 const r=await h.controller.sample({sessionId:'s',expectedTurnId:1});assert(r.suggestion);
 const call=h.adapter.calls.at(-1),prompt=call.messages.at(-1).content[0].text;
 assert(prompt.indexOf('用户自定义')<prompt.indexOf('MANDATORY PREDICTION RULES'));
 assert.equal(call.messages.slice(0,-1).some(m=>m.content.some?.(x=>String(x.text??'').includes('用户自定义'))),false);
 const before=h.controller.engine.epoch;await writeFile(file,'额外 spec 第二版');h.controller.state('s');assert(h.controller.engine.epoch>before);
});
test('invalid policy or oversized user constraints leave the last valid configuration intact',async t=>{
 const h=await mountHost(t),before=h.controller.engine.config.maxSuggestionTokens;
 await assert.rejects(h.controller.configure({maxSuggestionTokens:0}));assert.equal(h.controller.engine.config.maxSuggestionTokens,before);
 await assert.rejects(h.controller.configure({instructionText:'x'.repeat(8193)}));
 assert.equal(h.controller.engine.config.maxSuggestionTokens,999);
});
