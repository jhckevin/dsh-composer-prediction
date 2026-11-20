import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=dirname(fileURLToPath(import.meta.url)),root=resolve(base,'../..');
export async function buildClient({name='@local/dsh-composer-prediction',out=resolve(root,'lib/client.js')}={}) {
 const files=['index.cjs','controller.cjs','guards.cjs','locales.cjs','policy-fields.cjs','controls.cjs','placeholder.cjs','events.cjs','onboarding.cjs','blacklist.cjs','settings.cjs','brand.cjs'];
 const sources=await Promise.all(files.map(name=>readFile(resolve(base,name),'utf8')));
 const modules=files.map((name,i)=>JSON.stringify(name)+':function(module,exports,require){\n'+sources[i]+'\n}').join(',\n');
 const code='window.__ModuleLoader__.load({id:'+JSON.stringify(name)+',factory:(require)=>{\n'+
   'const definitions={'+modules+'};const cache=Object.create(null);\n'+
   'function load(id){if(cache[id])return cache[id].exports;const fn=definitions[id];if(!fn)return require(id);const module={exports:{}};cache[id]=module;fn(module,module.exports,(request)=>request.startsWith("./")?load(request.slice(2)):require(request));return module.exports;}\n'+
   'return load("index.cjs");\n}});\n//# sourceMappingURL=client.js.map\n';
 await mkdir(dirname(out),{recursive:true});await writeFile(out,code);
 await writeFile(out+'.map',JSON.stringify({version:3,file:'client.js',sources:files.map(name=>'../src/client/'+name),sourcesContent:sources,names:[],mappings:''}));
 return {out,bytes:Buffer.byteLength(code),modules:files.length};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 let name=process.argv[2];if(!name)try{name=JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).name}catch{}
 console.log(JSON.stringify(await buildClient({name})));
}
