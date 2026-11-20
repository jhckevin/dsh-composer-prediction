import {readFile,readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(fileURLToPath(new URL('..',import.meta.url))),base=join(root,'plugin');
const pkg=JSON.parse(await readFile(join(base,'package.json'),'utf8'));
if(pkg.name!=='@jhckevin/dsh-composer-prediction'||pkg.repository?.directory!=='plugin')throw Error('Package identity/metadata mismatch');
const entries=(await readFile(join(base,'MANIFEST.sha256'),'utf8')).trim().split('\n');
for(const line of entries){const [expected,name]=line.split('  ');if(!name||name.includes('..')||name.startsWith('/'))throw Error('Unsafe manifest path');const actual=createHash('sha256').update(await readFile(join(base,name))).digest('hex');if(actual!==expected)throw Error('Manifest mismatch: '+name)}
let scanned=0;
async function scan(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  if(['.git','.qa','.visual','.release','reference','node_modules'].includes(entry.name))continue;
  const path=join(dir,entry.name);if(entry.isDirectory()){await scan(path);continue}
  if(!entry.isFile()||!/\.(?:mjs|cjs|json|map|md|ps1|cmd|yml)$/.test(entry.name))continue;
  const data=await readFile(path,'utf8');scanned++;
  if(/(?:sk-[A-Za-z0-9]{24,}|npm_[A-Za-z0-9]{24,}|gh[oopsru]_[A-Za-z0-9]{24,}|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY)/.test(data))throw Error('Possible credential: '+path);
 }
}
await scan(root);console.log(JSON.stringify({version:pkg.version,manifestVerified:entries.length,sourceFilesScanned:scanned,credentialScan:'passed'}));
