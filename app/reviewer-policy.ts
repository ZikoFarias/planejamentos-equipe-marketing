import type {Task} from './model';
import {isPurchase} from './purchases';
import {externalMediaLabel} from './external-media-label';
import type {LabelConfig} from './labels';
export function lucioOnly(task:Task,labels:LabelConfig={}){return isPurchase(task)||!!externalMediaLabel(task,labels)}
