import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {root,reference} from './setup.mjs';
import {buildClient} from '../plugin/src/client/build.mjs';
const {buildNative}=await import('../plugin/tests/support/build-native.mjs');
await import('./sync-docs.mjs');
await buildNative();
await build({
 entryPoints:[join(reference,'vendor/schemastery/src/index.ts')],outfile:join(root,'plugin/lib/schema.mjs'),
 bundle:true,platform:'node',format:'esm',target:'node24',sourcemap:true,
 plugins:[{name:'pinned-schema',setup(b){b.onResolve({filter:/^@deepseek-ai\/cosmokit$/},()=>({path:join(reference,'vendor/cosmokit/src/index.ts')}))}}]
});
await build({entryPoints:[join(root,'scripts/tokenizer-source.mjs')],outfile:join(root,'plugin/lib/tokenizer-runtime.mjs'),bundle:true,platform:'node',format:'esm',target:'node24',minify:true});
const pkg=JSON.parse(await readFile(join(root,'plugin/package.json'),'utf8'));
await buildClient({name:pkg.name});
await import('./refresh-manifest.mjs');
console.log('Built provider, schema, tokenizers and client');
