
/** Apply the same public file/image/tool-history projections as LlmRuntime. */
export function createDSHProjection(ctx,core) {
 return async (options,resolved) => {
  let messages=options.messages;
  if(messages.some(message=>core.contentHasFile(message.content))){
   messages=core.projectFilesToText(messages,ref=>{
    let hostPath;try{hostPath=ctx.get('attachments')?.fileHostPath(ref)}catch{return undefined}
    return hostPath===undefined?undefined:ctx.get('fs')?.processPathFromHostPath(hostPath);
   });
  }
  const entry=resolved.models.find(entry=>entry.id===options.model);
  if(!(entry?.inputModalities??['text']).includes('image')&&messages.some(message=>core.contentHasImage(message.content)))messages=core.projectImagesForTextModel(messages);
  const projected=core.projectToolUpdates(messages,options.tools,entry?.toolUpdate,options.toolHistory);
  return {...options,messages:projected.messages,...projected.tools===undefined?{}:{tools:projected.tools}};
 };
}
export function createDSHHooks(ctx,core) {
 return {
  resolveAttachments:()=>ctx.get('attachments'),
  resolveImageAccess:(attachments,ref)=>core.resolveImageAttachmentAccess(attachments,path=>ctx.get('fs')?.processPathFromHostPath(path),ref)
 };
}
