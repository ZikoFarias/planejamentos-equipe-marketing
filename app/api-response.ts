// Keep HTML gateway failures out of user-facing notifications; never replay writes here.
export async function apiResponse(response:Response):Promise<any>{try{return await response.json()}catch{throw Error(response.status===401?'Sua sessão terminou. Entre novamente.':'O servidor não conseguiu concluir a solicitação. Suas edições continuam abertas; tente novamente.')}}
