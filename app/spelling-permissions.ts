import type {Task} from './model';
import {canManageTask,type Actor} from './permissions';
import {isPurchase} from './purchases';
export function canDismissSpelling(task:Task,actor:Actor){return actor.role==='administrador'||actor.role==='editor'&&(actor.persona==='lucio'||actor.persona==='mateus'&&!isPurchase(task)||actor.persona==='farias'&&canManageTask(task,actor))}
