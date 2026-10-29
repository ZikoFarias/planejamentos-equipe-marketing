import type {Task} from './model';
const managed=new Set(['approval','spelling','history','postedAt']);
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function rebaseBoardEdit(base:Task[],intended:Task[],latest:Task[]):Task[]{
 const original=new Map(base.map(t=>[t.id,t])),desired=new Map(intended.map(t=>[t.id,t]));
 const result:Task[]=[];
 for(const current of latest){
  const before=original.get(current.id),after=desired.get(current.id);
  if(!before){if(after)throw Error('Um cartão com este identificador já existe. Reabra o quadro.');result.push(current);continue}
  const keys=[...new Set([...Object.keys(before),...Object.keys(current),...Object.keys(after||{})])] as (keyof Task)[];
  if(!after){if(keys.some(key=>!managed.has(key)&&!equal(before[key],current[key])))throw Error('O cartão recebeu alterações durante a exclusão. Confira antes de excluir.');continue}
  const next={...current};
  for(const key of keys){if(managed.has(key)||equal(before[key],after[key]))continue;if(!equal(current[key],before[key])&&!equal(current[key],after[key]))throw Error('O mesmo campo foi atualizado no quadro. Suas edições foram preservadas no painel; confira antes de salvar.');(next as any)[key]=after[key]}
  result.push(next);
 }
 for(const task of intended)if(!latest.some(t=>t.id===task.id)){const before=original.get(task.id);if(!before)result.push(task);else if(!equal(before,task))throw Error('Este cartão foi removido durante a edição. Suas edições continuam no painel.')}
 return result;
}
