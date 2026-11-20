import{fingerprint}from'./context-mapping.mjs';
const ORIGIN='https://api.deepseek.com';
/** Resolve only the selected provider's credential reference. Never borrow another account or send keys to a guessed endpoint. */
export function balanceRoute(ctx,profiles,profile,snapshot){
 if(profile){let supported=false;try{supported=['deepseek-messages','responses','chat-completions','anthropic-messages'].includes(profile.protocol)&&new URL(profile.baseURL).origin===ORIGIN}catch{}return{origin:profile.baseURL,key:fingerprint({origin:profile.baseURL,accountId:profile.accountId,credential:profile.credential}),supported,credential:()=>profiles.resolveCredential(profile)}}
 const provider=snapshot.options.provider;const directory=ctx.llm.listConfigurableProviders?.().find(p=>p.provider===provider),descriptor=directory&&ctx.get('settings')?.describe({redactSecrets:true}).find(x=>x.ns===directory.settingsNs);let values=descriptor?.value;
 for(const field of directory?.settingsPath??[])values=values?.[field];
 // A configurable native route is required; an ambient/default key is not a substitute for unknown wiring.
 const ref=values?.apiKeyEnv,baseURL=values?.baseURL??ctx.get('launchEnvironment')?.get('DEEPSEEK_BASE_URL')?.value??ORIGIN;
 let supported=false;try{supported=provider==='deepseek-official'&&typeof ref==='string'&&!!ctx.get('credentials')&&new URL(baseURL).origin===ORIGIN}catch{}
 return{origin:baseURL,key:fingerprint({provider,origin:baseURL,credentialRef:ref??null}),supported,credential:async()=>{const value=(await ctx.get('credentials')?.resolve(ref))?.value;if(typeof value!=='string'||!value.trim()||/[\r\n]/.test(value))throw Error('Balance credential unavailable');return value}};
}
export async function queryDeepSeekBalance(route,{fetch=globalThis.fetch,signal=AbortSignal.timeout(5000)}={}){
 if(route.supported===false)throw Error('Balance API unsupported');const key=await route.credential();if(typeof key!=='string'||!key.trim()||/[\r\n]/.test(key))throw Error('Balance credential unavailable');
 const response=await fetch(ORIGIN+'/user/balance',{method:'GET',headers:{Authorization:'Bearer '+key,Accept:'application/json'},redirect:'error',signal});if(!response.ok)throw Error('Balance API failed');const text=await response.text();if(text.length>65536)throw Error('Balance response too large');const data=JSON.parse(text);
 if(typeof data.is_available!=='boolean'||!Array.isArray(data.balance_infos))throw Error('Invalid balance response');
 const balances=data.balance_infos.map(x=>{if(!['CNY','USD'].includes(x.currency)||typeof x.total_balance!=='string'||!/^-?\d{1,20}(?:\.\d{1,12})?$/.test(x.total_balance))throw Error('Invalid balance amount');return{currency:x.currency,total:x.total_balance}});
 return{available:data.is_available,balances};
}
