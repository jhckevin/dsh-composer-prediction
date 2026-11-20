
import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
const root=new URL('../',import.meta.url);
test('registry bundle uses its own canonical name and preserves the runtime/data identity',async()=>{
 const p=JSON.parse(await readFile(new URL('package.json',root),'utf8')),patch=await readFile(new URL('cordis.patch.yml',root),'utf8');
 assert.equal(p.name,'@jhckevin/dsh-composer-prediction');assert.equal(p.version,'0.8.0-beta.4');assert.equal(p.private,undefined);assert.equal(p.publishConfig.access,'public');assert.equal(p.publishConfig.registry,'https://registry.npmjs.org/');assert.equal(p.publishConfig.tag,'latest');assert.ok(p.dsh.bundle.patch);assert.match(patch,/id: composer-prediction/);assert.ok(patch.includes(p.name));assert.ok(!patch.includes('@local/'));
 for(const s of ['preinstall','install','postinstall','prepare'])assert.equal(p.scripts[s],undefined);
});
test('bilingual details explain host-owned updates, migration and honest first-release state',async()=>{
 for(const lang of ['zh-CN','en']){
  const doc=await readFile(new URL('docs/README.'+lang+'.md',root),'utf8');
  assert.ok(doc.includes('@jhckevin/dsh-composer-prediction'));assert.ok(doc.includes('0.8.0-beta.4'));assert.ok(doc.includes('plugins-data/composer-prediction'));assert.ok(!doc.includes('npm 发布保持暂停'));assert.ok(!doc.includes('0.7.1-experimental.1'));
 }
});
