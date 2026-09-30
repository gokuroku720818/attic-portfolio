export interface HistoryDay {day:string;values:Record<string,{rank:number;rate:number}>}
export function updateHistory(rows:HistoryDay[],next:HistoryDay):HistoryDay[]{return [...rows.filter(r=>r.day!==next.day),next].sort((a,b)=>a.day.localeCompare(b.day)).slice(-90);}
export function loadHistory():HistoryDay[]{try{const rows=JSON.parse(localStorage.getItem('attic_history_v1')||'[]');return Array.isArray(rows)?rows.filter(r=>typeof r.day==='string'&&r.values&&typeof r.values==='object'):[];}catch{return [];}}
