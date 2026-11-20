'use strict';
function inputEligible(input) {
  return !!input && input.phase==='plain' && input.draft==='' &&
    (input.attachmentIds?.length??0)===0 && (input.occurrences?.length??0)===0 && (input.queue?.length??0)===0;
}
function sessionEligible(session) {
  return !!session && session.openState==='open' && !session.running && !session.removed &&
    !session.blank && !session.awaitingFirstTurn && !session.loadingOlder &&
    (session.pendingSubmissions?.length??0)===0 && session.subagent===null;
}
function acceptanceKey(event) {
  return ['Tab','ArrowRight','Enter'].includes(event.key) && !event.defaultPrevented &&
    !event.isComposing && !event.repeat && event.keyCode!==229 &&
    !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
}
function emptyParagraph(editor) {
  if(!editor || editor.getAttribute('aria-disabled')==='true' || editor.getAttribute('contenteditable')!=='true') return false;
  if(editor.children.length===0)return (editor.textContent??'')==='';
  if(editor.children.length!==1 || editor.children[0].tagName!=='P') return false;
  const paragraph=editor.children[0];
  return (paragraph.textContent??'')==='' && !paragraph.querySelector('[data-lexical-decorator],img,button,input');
}
function editorEligible(editor,card) {
  return emptyParagraph(editor) && !editor.hasAttribute('data-composer-composing') &&
    editor.getAttribute('aria-expanded')!=='true' && !editor.getAttribute('aria-activedescendant') &&
    !card.ownerDocument?.querySelector('[role="dialog"][aria-modal="true"],[role="menu"],[role="listbox"]') &&
    !card.querySelector('[role="combobox"][aria-expanded="true"],[role="listbox"],[role="menu"]');
}
module.exports={inputEligible,sessionEligible,acceptanceKey,emptyParagraph,editorEligible};
