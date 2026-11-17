export const boardActionRevision='X-Board-Action-Revision';
export function recordableBoardResponse(response:Response,revision:number){
 response.headers.set(boardActionRevision,String(revision));
 return response;
}
