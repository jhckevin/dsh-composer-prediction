import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
for(const [lang,name] of [['zh-CN','README.md'],['en','README.en.md']]){
 let text=(await readFile(join(root,name),'utf8')).split('\n').filter(line=>!line.startsWith('[![npm]')).join('\n').replaceAll('plugin/assets/','assets/').replaceAll('(plugin/package.json)','(package.json)').replaceAll('(plugin/PROTOCOL-COMPAT.zh-CN.md)','(PROTOCOL-COMPAT.zh-CN.md)').replaceAll('(plugin/THIRD_PARTY_NOTICES.md)','(THIRD_PARTY_NOTICES.md)').replaceAll('(CONTRIBUTING.md)','(https://github.com/jhckevin/dsh-composer-prediction/blob/main/CONTRIBUTING.md)');
 await writeFile(join(root,'plugin',lang==='zh-CN'?'README.md':'README.en.md'),text);
 if(lang==='zh-CN')await writeFile(join(root,'plugin/README.zh-CN.md'),text);
 text=text.replaceAll('(assets/','(../assets/').replaceAll('(docs/','(').replaceAll('(package.json)','(../package.json)').replaceAll('(LICENSE)','(../LICENSE)').replaceAll('(THIRD_PARTY_NOTICES.md)','(../THIRD_PARTY_NOTICES.md)').replaceAll('(PROTOCOL-COMPAT.zh-CN.md)','(../PROTOCOL-COMPAT.zh-CN.md)');
 if(lang==='en')text=text.replaceAll('(README.md)','(README.zh-CN.md)');
 await writeFile(join(root,'plugin/docs','README.'+lang+'.md'),text);
}
async function copyDocs(dir,prefix=''){
 for(const file of await readdir(dir,{withFileTypes:true})){
  const relative=join(prefix,file.name),destination=join(root,'plugin/docs',relative);
  if(file.isDirectory()){await mkdir(destination,{recursive:true});await copyDocs(join(dir,file.name),relative);}
  else if(file.name.endsWith('.md'))await writeFile(destination,(await readFile(join(dir,file.name),'utf8')).replaceAll('../../plugin/','../../').replaceAll('../plugin/','../'));
 }
}
await copyDocs(join(root,'docs'));
