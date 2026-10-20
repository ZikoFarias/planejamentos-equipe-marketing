export const priorityColors:Record<string,string>={urgente:'#ff5555',alta:'#ffb347',normal:'#579dff',baixa:'#9fcead'};
export function normalizeHex(value:string){const clean=value.trim().replace(/^#/,'');return /^[a-f0-9]{6}$/i.test(clean)?'#'+clean.toLowerCase():/^[a-f0-9]{3}$/i.test(clean)?'#'+[...clean].map(c=>c+c).join('').toLowerCase():''}
