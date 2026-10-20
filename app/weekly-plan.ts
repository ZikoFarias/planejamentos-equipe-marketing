import {StatusConfig,emptyStatusConfig,configuredTask} from './status-config';
import {assignStatusOwner} from './permissions';
import {blank,Task} from './model';
import {companyOf} from './workflow';
import {weekDates} from './week';
export const weeklyTitle='DESIGN PARA REDE-SOCIAIS';
export const dayNames=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const materials=['materiais-ps','materiais-smo'];
export const weeklySchedule=[['posto-ps','posto-brr','concreto'],['fibroplast','posto-rv',...materials],['fibroplast','posto-brr','ervateira',...materials],['posto-ps'],['fibroplast','posto-ps','posto-rv','ervateira',...materials,'concreto'],['fibroplast',...materials],['posto-rv','ervateira']];
export function canLaunchWeekly(role:string,persona:string){return role==='administrador'||(role==='editor'&&['mateus','lucio'].includes(persona))}
export function validDay(day:unknown){return day==='all'||(typeof day==='string'&&/^[0-6]$/.test(day))}
export function validDate(date:unknown):date is string{if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;const d=new Date(date+'T12:00:00Z');return !isNaN(+d)&&d.toISOString().slice(0,10)===date}
export function weeklyPlan(current:Task[],anchor:string,day:string,config:StatusConfig=emptyStatusConfig){const dates=weekDates(anchor);return weeklySchedule.flatMap((companies,i)=>day!=='all'&&Number(day)!==i?[]:companies.map(company=>{const date=dates[i],id=`weekly-${date}-${company}`,designer=company.startsWith('posto-')||company==='ervateira'?'Luiz':'Farias';const task:Task={...blank(`a fazer ${designer.toLowerCase()}`),id,title:weeklyTitle,tags:[company],assignees:[designer,'Lucio Alves Xavier','Mateus'],start:date,due:date,description:'Arte semanal para Instagram.'};const existing=current.find(t=>t.id===id||(t.title.trim().toLocaleUpperCase('pt-BR')===weeklyTitle&&t.due===date&&companyOf(t)?.id===company));return {task:assignStatusOwner(configuredTask(task,config)),company,day:i,existing:!!existing,existingId:existing?.id}}))}
