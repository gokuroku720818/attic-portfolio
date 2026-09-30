import {useState} from 'react';
import {useAtticStore} from '../context/AtticContext';
export function PerformanceHistory({memberId}:{memberId:string}){
 const {history}=useAtticStore();const [days,setDays]=useState(30);
 const cutoff=new Date(Date.now()-days*86400000).toISOString().slice(0,10);
 const rows=history.filter(r=>r.day>=cutoff&&r.values[memberId]);
 const rates=rows.map(r=>r.values[memberId].rate);
 const low=Math.min(...rates),high=Math.max(...rates),span=Math.max(high-low,1);
 const points=rates.map((v,i)=>`${10+i*280/Math.max(rates.length-1,1)},${90-(v-low)*70/span}`).join(' ');
 return <section className="mt-5 p-4 rounded-xl border border-slate-700 bg-slate-800/30">
  <div className="flex justify-between gap-3"><h3 className="text-sm font-bold">수익률 기록</h3><select aria-label="기록 기간" value={days} onChange={e=>setDays(Number(e.target.value))} className="bg-slate-800 text-xs rounded px-2"><option value={7}>최근 7일</option><option value={30}>최근 30일</option></select></div>
  {rows.length>1?<><svg role="img" aria-label="기록된 날짜별 누적 수익률 그래프" viewBox="0 0 300 110" className="w-full h-32"><polyline points={points} fill="none" stroke="#fbbf24" strokeWidth="2"/><text x="10" y="105" fill="#94a3b8" fontSize="8">{rows[0].day}</text><text x="240" y="105" fill="#94a3b8" fontSize="8">{rows[rows.length-1].day}</text></svg><p className="text-xs text-slate-400">누적 수익률 변화: {(rates[rates.length-1]-rates[0]).toFixed(2)}%p</p></>:<p className="text-xs text-slate-400 py-4">기록을 모으고 있습니다. 2일 이상 기록되면 그래프가 표시됩니다.</p>}
  <p className="text-[10px] text-slate-500 mt-2">이 브라우저에서 확인한 날짜별 기록 · 자산 추가·매도도 반영되는 누적 수익률이며 기간 투자수익률과 다를 수 있습니다.</p>
 </section>;
}
