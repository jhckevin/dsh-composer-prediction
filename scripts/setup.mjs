import {mkdir,writeFile,readFile,lstat,symlink,access,rename,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
export const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
export const commit='e8f7b93a344964de3dca1ace9e72b6e4d6de87cb';
export const archiveHash='96bbd0ac8201c9a74a1641efe53fcb20c69d11e9ef8525ef01e1fede662d0c20';
export const reference=process.env.DSH_REFERENCE_SOURCE??join(root,'reference/full-source/deepseek-harness-'+commit);
await access(join(root,'node_modules/esbuild/package.json'));
await mkdir(join(root,'.qa'),{recursive:true});
await writeFile(join(root,'.qa/package.json'),'{"private":true,"type":"module"}\n');
const modules=join(root,'.qa/node_modules');
try{await lstat(modules)}catch(e){if(e.code!=='ENOENT')throw e;await symlink(join(root,'node_modules'),modules,process.platform==='win32'?'junction':'dir')}
try{await access(join(reference,'packages'));console.log('Using pinned DSH source:',reference)}
catch(e){
 if(process.env.DSH_REFERENCE_SOURCE)throw Error('DSH_REFERENCE_SOURCE must contain packages/ and vendor/');
 const base=join(root,'reference/full-source');await mkdir(base,{recursive:true});
 const archive=join(root,'reference/dsh-'+commit+'.tar.gz');
 let bytes;
 try{bytes=await readFile(archive)}catch(e){if(e.code!=='ENOENT')throw e}
 if(!bytes||createHash('sha256').update(bytes).digest('hex')!==archiveHash){
  const response=await fetch('https://codeload.github.com/deepseek-ai/deepseek-harness/tar.gz/'+commit,{signal:AbortSignal.timeout(180000)});
  if(!response.ok)throw Error('DSH source download failed: '+response.status);
  bytes=Buffer.from(await response.arrayBuffer());
  if(createHash('sha256').update(bytes).digest('hex')!==archiveHash)throw Error('Pinned DSH archive checksum mismatch');
  await writeFile(archive,bytes);
 }
 const result=spawnSync('tar',['-xzf',archive,'-C',base],{stdio:'inherit'});
 if(result.status!==0)throw Error('tar could not extract the verified DSH archive');
 await access(join(reference,'packages'));
 console.log('Pinned DSH archive verified and extracted');
}
