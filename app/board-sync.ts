// Reject stale reads and responses that raced with edits or local saves.
export function canApplyBoardUpdate(currentRevision:number,incomingRevision:number,sameState:boolean,editing:boolean){return sameState&&!editing&&Number.isSafeInteger(incomingRevision)&&incomingRevision>=currentRevision}
