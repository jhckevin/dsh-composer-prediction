'use strict';
const HINT='--dsh-composer-hint',OWNER='data-dsh-prediction-ghost';
function cssString(text){return '"'+text.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r\n?|\n/g,'\\a ').replace(/\t/g,'\\9 ')+'"'}
function ghostAvailable(mount){const editor=mount.editor;if(!editor?.style?.getPropertyValue)return false;const current=editor.style.getPropertyValue(HINT);return !current||mount.ghost?.editor===editor&&current===mount.ghost.appliedValue}
function restore(mount){
 const ghost=mount.ghost;
 if(ghost&&ghost.editor.getAttribute(OWNER)===mount.owner){if(ghost.editor.style.getPropertyValue(HINT)===ghost.appliedValue&&ghost.editor.style.getPropertyPriority(HINT)===ghost.appliedPriority){if(ghost.value)ghost.editor.style.setProperty(HINT,ghost.value,ghost.priority);else ghost.editor.style.removeProperty(HINT)}ghost.editor.removeAttribute(OWNER)}
 mount.ghost=null;
 const saved=mount.placeholder;
 if(saved&&saved.node.getAttribute('data-dsh-prediction-owner')===mount.owner){if(saved.node.style.getPropertyValue('visibility')==='hidden'&&saved.node.style.getPropertyPriority('visibility')===saved.appliedPriority){if(saved.value)saved.node.style.setProperty('visibility',saved.value,saved.priority);else saved.node.style.removeProperty('visibility')}saved.node.removeAttribute('data-dsh-prediction-owner')}
 mount.placeholder=null;mount.node.removeAttribute?.('data-dsh-prediction-show');
}
function paint(mount,show,text){
 if(!show||typeof text!=='string'||!text){restore(mount);return}
 const editor=mount.editor;if(!editor||!ghostAvailable(mount)){restore(mount);return}
 if(mount.ghost&&mount.ghost.editor!==editor)restore(mount);
 if(!mount.ghost){mount.ghost={editor,value:editor.style.getPropertyValue(HINT),priority:editor.style.getPropertyPriority(HINT)};editor.setAttribute(OWNER,mount.owner)}
 const ghost=mount.ghost,value=cssString(text);ghost.appliedValue=value;ghost.appliedPriority='';
 if(editor.style.getPropertyValue(HINT)!==value||editor.style.getPropertyPriority(HINT))editor.style.setProperty(HINT,value);
 const node=mount.card.querySelector('[data-composer-placeholder]');
 if(mount.placeholder?.node!==node){const old=mount.placeholder;if(old&&old.node.getAttribute('data-dsh-prediction-owner')===mount.owner){if(old.node.style.getPropertyValue('visibility')==='hidden'&&old.node.style.getPropertyPriority('visibility')===old.appliedPriority){if(old.value)old.node.style.setProperty('visibility',old.value,old.priority);else old.node.style.removeProperty('visibility')}old.node.removeAttribute('data-dsh-prediction-owner')}mount.placeholder=node?{node,value:node.style.getPropertyValue('visibility'),priority:node.style.getPropertyPriority('visibility')}:null;if(node)node.setAttribute('data-dsh-prediction-owner',mount.owner)}
 if(node?.getAttribute('data-dsh-prediction-owner')===mount.owner){if(node.style.getPropertyValue('visibility')!=='hidden'||node.style.getPropertyPriority('visibility')!=='important')node.style.setProperty('visibility','hidden','important');mount.placeholder.appliedPriority=node.style.getPropertyPriority('visibility')}
 mount.node.setAttribute?.('data-dsh-prediction-show','');
}
module.exports={paint,restore,ghostAvailable,cssString};
