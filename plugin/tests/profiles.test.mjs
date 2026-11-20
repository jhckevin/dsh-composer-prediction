import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateProfile, publicProfile, profileCacheScope, ProfileManager, loadProfileFile } from '../src/core/profiles.mjs';
const base = () => ({version:1,id:'ds',protocol:'deepseek-messages',baseURL:'https://api.deepseek.com/anthropic/',model:'deepseek-flash',accountId:'primary',credential:{env:'DS_KEY'},request:{thinking:{type:'enabled'}},cache:{}});
test('validated immutable snapshot and public credential redaction', () => {
  const p = validateProfile(base());
  assert.equal(p.baseURL, 'https://api.deepseek.com/anthropic');
  assert.ok(Object.isFrozen(p.request));
  assert.equal(publicProfile(p).credential.kind,'env');
  assert.ok(!JSON.stringify(publicProfile(p)).includes('DS_KEY'));
  assert.throws(()=>validateProfile({...base(),apiKey:'DO_NOT_PERSIST'}),/embedded/);
  assert.throws(()=>validateProfile({...base(),request:{headers:{Authorization:'secret'}}}),/embedded/);
  assert.throws(()=>validateProfile({...base(),request:{headers:{'x-api-key':'secret'}}}),/embedded/);
  assert.throws(()=>validateProfile({...base(),baseURL:'https://user:pass@example.org'}),/userinfo/);
  assert.throws(()=>validateProfile({...base(),baseURL:'http://example.org'}),/HTTPS/);
  assert.doesNotThrow(()=>validateProfile({...base(),baseURL:'http://localhost:1234/v1'}));
});
test('cache scopes isolate endpoint, account, profile, model, config and credential reference', () => {
  const b=base(), scope = profileCacheScope(validateProfile(b));
  for (const patch of [{id:'other'},{accountId:'other'},{model:'other'},{baseURL:'https://other.example/v1'},{protocol:'responses'},{request:{thinking:{type:'disabled'}}},{credential:{env:'OTHER_KEY'}}]) assert.notEqual(profileCacheScope(validateProfile({...b,...patch})),scope);
  assert.notEqual(profileCacheScope(validateProfile(b),{tools:[{name:'read'}]}),scope);
  assert.equal(profileCacheScope(validateProfile({...b,label:'cosmetic'})),scope);
});
test('profile selection/reload atomicity, secret resolution and allowlisted paths', async () => {
  const dir=await mkdtemp(join(tmpdir(),'prediction-profiles-')), outside=await mkdtemp(join(tmpdir(),'prediction-outside-'));
  try {
    const file=join(dir,'ds.json'); await writeFile(file,JSON.stringify(base()));
    const m=new ProfileManager({directory:dir,env:{DS_KEY:'in-memory-only'}});
    assert.equal((await m.list()).length,1); await m.select('ds');
    assert.equal(await m.resolveCredential(),'in-memory-only');
    const prior=m.current().digest; await writeFile(file,JSON.stringify({...base(),model:'other'}));
    await m.reload(); assert.notEqual(m.current().digest,prior);
    const valid=m.current(); await writeFile(file,'{broken');
    await assert.rejects(m.reload()); assert.equal(m.current(),valid);
    // Isolate the unsafe-path assertion from the intentionally corrupt JSON checked above.
    await writeFile(file,JSON.stringify({...base(),model:'other'}));
    const bad=join(outside,'bad.json'); await writeFile(bad,JSON.stringify(base()));
    await assert.rejects(loadProfileFile(bad,{allowedRoots:[dir]}),/outside/);
    await symlink(bad,join(dir,'link.json')); await assert.rejects(m.list(),/outside/);
    assert.ok(!JSON.stringify(m.publicCurrent()).includes('in-memory-only'));
  } finally { await rm(dir,{recursive:true,force:true}); await rm(outside,{recursive:true,force:true}); }
});
test('secret-ref resolver is explicit, failures contain no secret and duplicate ids fail', async () => {
  const dir=await mkdtemp(join(tmpdir(),'prediction-profiles-'));
  try {
    await writeFile(join(dir,'one.json'),JSON.stringify({...base(),credential:{secretRef:'vault/team/ds'}}));
    const m=new ProfileManager({directory:dir,secretResolver:async ref => ref==='vault/team/ds'?'resolved-value':undefined});
    await m.select('ds'); assert.equal(await m.resolveCredential(),'resolved-value');
    assert.ok(!JSON.stringify(m.publicCurrent()).includes('vault/team/ds'));
    const unavailable=new ProfileManager({directory:dir});await unavailable.select('ds');
    await assert.rejects(unavailable.resolveCredential(),/unavailable/);
    await writeFile(join(dir,'two.json'),JSON.stringify(base())); await assert.rejects(m.list(),/duplicate/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('price configuration validation and native bridge profile without API credentials', () => {
  const b=base();
  const prices={versions:[{id:'v1',effectiveFrom:'2026-11-12T00:00:00Z',currency:'CNY',rates:{input:2,cacheRead:.04,output:8}}]};
  assert.doesNotThrow(()=>validateProfile({...b,pricing:prices}));
  assert.throws(()=>validateProfile({...b,pricing:{versions:[{...prices.versions[0],rates:{input:-1,cacheRead:0,output:1}}]}}),/rate/);
  assert.doesNotThrow(()=>validateProfile({version:1,id:'native',protocol:'codex-native',model:'native',accountId:'desktop'}));
});
