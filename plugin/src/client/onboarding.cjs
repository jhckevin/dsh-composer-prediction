'use strict';
const KEY='dsh.composerPrediction.firstUse.v1';
const acknowledged=new WeakSet();
function showFirstUseNotice(doc,t){
 if(!doc?.body||acknowledged.has(doc))return()=>{};
 try{if(doc.defaultView.localStorage.getItem(KEY)==='acknowledged')return()=>{}}catch{}
 if(doc.querySelector('[data-dsh-prediction-first-use]'))return()=>{};
 const dialog=doc.createElement('dialog');dialog.className='dsh-prediction-first-use';dialog.setAttribute('data-dsh-prediction-first-use','');dialog.setAttribute('aria-labelledby','dsh-prediction-first-use-title');
 const title=doc.createElement('h2');title.id='dsh-prediction-first-use-title';title.textContent=t('firstUseTitle');
 const text=doc.createElement('p');text.textContent=t('completionHelp');
 const button=doc.createElement('button');button.type='button';button.autofocus=true;button.textContent=t('firstUseConfirm');
 const remember=()=>{acknowledged.add(doc);try{doc.defaultView.localStorage.setItem(KEY,'acknowledged')}catch{};dialog.remove()};
 button.addEventListener('click',()=>{if(typeof dialog.close==='function')dialog.close();remember()});
 dialog.addEventListener('close',remember);
 dialog.append(title,text,button);doc.body.append(dialog);
 try{if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','')}catch{dialog.setAttribute('open','')}
 return()=>{dialog.removeEventListener('close',remember);dialog.remove()};
}
module.exports={showFirstUseNotice,KEY};
