import { build } from '../../../.qa/node_modules/esbuild/lib/main.js';
import { readdir, readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinModules } from 'node:module';
const project = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const reference = process.env.DSH_REFERENCE_SOURCE ?? join(project, 'reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb');
const aliases = new Map();
async function scan(dir) {
  for (const entry of await readdir(dir, {withFileTypes:true})) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const target = join(dir, entry.name);
    if (entry.isDirectory()) await scan(target);
    else if (entry.name === 'package.json') {
      const pkg = JSON.parse(await readFile(target,'utf8'));
      if (pkg.name) aliases.set(pkg.name, {root:dir,pkg});
    }
  }
}
export async function buildIntegrationBundle() {
  await scan(join(reference,'vendor')); await scan(join(reference,'packages'));
  const out = join(project, '.qa/host-integration/source-bundle.mjs');
  await mkdir(dirname(out),{recursive:true});
  const result=await build({
    stdin:{contents:`
      export { Context, Service, FiberState } from '@deepseek-ai/cordis';
      export { Session, SessionStore, SessionId, SessionSeq } from '@deepseek-ai/dsh-session';
      export * as llmCore from '@deepseek-ai/dsh-llm';
      export * as deepSeekModule from '@deepseek-ai/dsh-llm-deepseek';
      export { createDSHProjection,createDSHHooks } from '${project}/plugin/src/core/dsh-projection.mjs';
      export { runTransport } from '${project}/plugin/src/core/transports.mjs';
      export { LlmRuntime, LlmAdapter, createUserMessage, createMessage, createToolResultMessage } from '@deepseek-ai/dsh-llm';
      export { AgentRegistry } from '@deepseek-ai/dsh-agent';
      export { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
      export { HostConnectionService } from '${reference}/packages/client/connection/src/rpc-host.ts';
      export * as predictionPlugin from '${project}/plugin/src/index.mjs';
    `,resolveDir:project,sourcefile:'host-source-integration.ts',loader:'ts'},
    outfile:out,bundle:true,platform:'node',format:'esm',target:'node24',sourcemap:true,write:false,
    nodePaths:[join(project,'.qa/node_modules')],
    external:[...builtinModules,...builtinModules.map(x=>'node:'+x)],
    plugins:[{name:'pinned-workspace-source',setup(b){
      b.onResolve({filter:/^@deepseek-ai\//}, args=>{
        const candidates=[...aliases.keys()].filter(k=>args.path===k||args.path.startsWith(k+'/')).sort((a,b)=>b.length-a.length);
        const item=aliases.get(candidates[0]); if(!item)return;
        const suffix=args.path.slice(candidates[0].length);
        if(suffix==='/package.json')return {path:join(item.root,'package.json')};
        if(suffix.startsWith('/src/'))return {path:join(item.root,suffix.slice(1))};
        let target=suffix? suffix.slice(1):'index';
        return {path:join(item.root,'src',target+'.ts')};
      });
    }}],
  });
  for(const file of result.outputFiles){const temp=file.path+'.'+process.pid+'.tmp';await writeFile(temp,file.contents);await rename(temp,file.path);}
  return import(out+'?t='+Date.now());
}

