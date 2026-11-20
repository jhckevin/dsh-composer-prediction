import { build } from '../../../.qa/node_modules/esbuild/lib/main.js';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { builtinModules } from 'node:module';
const project=resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const reference=process.env.DSH_REFERENCE_SOURCE??join(project,'reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb');
async function aliasesFor(dir,map=new Map()){
 for(const item of await readdir(dir,{withFileTypes:true})){
  if(item.name==='node_modules'||item.name.startsWith('.'))continue;
  const path=join(dir,item.name);
  if(item.isDirectory())await aliasesFor(path,map);
  else if(item.name==='package.json'){const pkg=JSON.parse(await readFile(path,'utf8'));if(pkg.name)map.set(pkg.name,dir);}
 }
 return map;
}
export async function buildNative(){
 const aliases=await aliasesFor(join(reference,'vendor'));await aliasesFor(join(reference,'packages'),aliases);
 const outfile=join(project,'plugin/lib/dsh-native.mjs');await mkdir(dirname(outfile),{recursive:true});
 const result=await build({
  stdin:{contents:`
   export {DeepSeekAdapter,resolveAdapterOptions} from '@deepseek-ai/dsh-llm-deepseek';
   export {contentHasFile,contentHasImage,projectFilesToText,projectImagesForTextModel,projectToolUpdates,resolveImageAttachmentAccess} from '@deepseek-ai/dsh-llm';
  `,resolveDir:project,sourcefile:'dsh-native-pinned-source.ts',loader:'ts'},
  outfile,bundle:true,metafile:true,platform:'node',format:'esm',target:'node24',sourcemap:true,
  nodePaths:[join(project,'.qa/node_modules')],
  banner:{js:'// Source: deepseek-ai/deepseek-harness e8f7b93a344964de3dca1ace9e72b6e4d6de87cb (MIT).\n// Self-contained provider serialization and public model-input projections; no application bootstrap.'},
  external:[...builtinModules,...builtinModules.map(x=>'node:'+x)],
  plugins:[{name:'pinned-dsh-native',setup(b){
   b.onResolve({filter:/^@deepseek-ai\//},args=>{
    const name=[...aliases.keys()].filter(k=>args.path===k||args.path.startsWith(k+'/')).sort((a,b)=>b.length-a.length)[0];
    if(!name)return;
    const root=aliases.get(name),suffix=args.path.slice(name.length);
    if(suffix==='/package.json')return{path:join(root,'package.json')};
    if(suffix.startsWith('/src/'))return{path:join(root,suffix.slice(1))};
    return {path:join(root,'src',(suffix?suffix.slice(1):'index')+'.ts')};
   });
  }}]
 });
 const imported=Object.values(result.metafile.outputs).flatMap(out=>out.imports).filter(item=>item.external).map(item=>item.path);
 if(imported.some(name=>!builtinModules.includes(name)&&!name.startsWith('node:')))throw new Error('native bundle retained external package imports: '+imported.join(','));
 const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
 const inputs={};for(const path of Object.keys(result.metafile.inputs)){if(path.startsWith('<')||path==='dsh-native-pinned-source.ts')continue;inputs[path]=sha(await readFile(resolve(project,path)));}
 const manifest={sourceCommit:'e8f7b93a344964de3dca1ace9e72b6e4d6de87cb',bundleSha256:sha(await readFile(outfile)),mapSha256:sha(await readFile(outfile+'.map')),externalImports:imported,inputs};
 await mkdir(join(project,'.qa/host-integration'),{recursive:true});await writeFile(join(project,'.qa/host-integration/native-build-manifest.json'),JSON.stringify(manifest,null,2));
 return outfile;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(await buildNative());

