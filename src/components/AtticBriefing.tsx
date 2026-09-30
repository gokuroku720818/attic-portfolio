import {useEffect,useMemo,useState} from 'react';
import {useAtticStore} from '../context/AtticContext';
import {BriefingPeriod,BriefingSnapshot,buildBriefing,buildSnapshot,seoulDay} from '../services/briefing';
import {fetchBriefingSnapshots,saveBriefingSnapshot} from '../services/cloudBriefing';
const tabs:{id:BriefingPeriod;label:string;caption:string}[]=[{id:'day',label:'오늘의 브리핑',caption:'전날 기록 대비'},{id:'week',label:'주간 브리핑',caption:'최근 7일'},{id:'month',label:'월간 브리핑',caption:'최근 30일'}];
const signed=(n:number)=>`${n>=0?'+':''}${n.toFixed(2)}`;
export function AtticBriefing({onSelectMember}:{onSelectMember:(id:string)=>void}) {
 const {members,assets}=useAtticStore();
 const [period,setPeriod]=useState<BriefingPeriod>('day');
 const [rows,setRows]=useState<BriefingSnapshot[]>([]);
 const [status,setStatus]=useState('서버 기록 연결 중…');
 const [retry,setRetry]=useState(0);
 const [today,setToday]=useState(seoulDay);
 const live=useMemo(()=>buildSnapshot(members,assets),[members,assets,today]);
 useEffect(()=>{
  let stopped=false;
  const saveAndRead=async()=>{
   try {
    const saved=await saveBriefingSnapshot(live);
    const snapshots=await fetchBriefingSnapshots();
    if(!stopped){setRows(snapshots);setStatus(saved?'서버 공유 기록 저장 완료':'서버 저장 실패 · 다시 시도해 주세요');}
   } catch {if(!stopped)setStatus('서버 기록 연결 실패 · 다시 시도해 주세요');}
  };
  const timer=setTimeout(()=>void saveAndRead(),1200);
  return ()=>{stopped=true;clearTimeout(timer);};
 },[live,retry]);
 useEffect(()=>{const timer=setInterval(()=>{setToday(seoulDay());if(document.visibilityState==='visible')setRetry(n=>n+1);},60000);return()=>clearInterval(timer);},[]);
 const briefing=useMemo(()=>buildBriefing([...rows.filter(r=>r.day!==live.day),live],period,today),[rows,live,period,today]);
 const {latest,baseline,changes,moves,popular}=briefing;
 const champion=latest?.members[0];
 const climber=[...changes].filter(c=>c.rankDelta>0).sort((a,b)=>b.rankDelta-a.rankDelta)[0];
 const best=changes[0];
 const loser=moves.length?moves[moves.length-1]:undefined;
 const headline=best&&best.rateDelta>0?`${best.name}님, 누적 수익률 ${signed(best.rateDelta)}%p 상승!`:champion?`${champion.name}님이 다락방 선두를 달리고 있습니다.`:'첫 포트폴리오가 등록되면 브리핑이 시작됩니다.';
 return <section aria-label="다락방 브리핑" className="rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 overflow-hidden">
  <div className="p-5 sm:p-6">
   <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold tracking-widest text-amber-400">다락방 투자 리포트</p><h2 className="text-xl font-black mt-1">🗞️ 함께 보는 다락방 브리핑</h2></div><span className="text-xs text-slate-400">{today} · 한국 시간</span></div>
   <div role="tablist" aria-label="브리핑 기간" className="flex gap-2 mt-5">{tabs.map(t=><button key={t.id} role="tab" aria-selected={period===t.id} aria-controls="briefing-panel" id={`briefing-tab-${t.id}`} onClick={()=>setPeriod(t.id)} className={`flex-1 sm:flex-none rounded-xl px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-colors ${period===t.id?'bg-amber-400 text-slate-950':'bg-slate-800 text-slate-400 hover:text-white'}`}>{t.label}</button>)}</div>
   <div role="tabpanel" id="briefing-panel" aria-labelledby={`briefing-tab-${period}`} className="mt-5">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400"><span>{tabs.find(t=>t.id===period)?.caption} · {baseline?`${baseline.day} → ${latest?.day}`:'비교 기록 수집 중'}{baseline&&briefing.partial?' · 부분 기간':''}</span><span>{briefing.recordDays}일 기록</span></div>
    <p className="text-base sm:text-lg font-bold mt-3">{headline}</p>
    {!baseline&&<p className="text-sm text-slate-400 mt-2">첫 기록부터 차곡차곡 쌓고 있습니다. 비교할 날짜가 생기면 순위·수익률·종목 변화를 보여드립니다.</p>}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
     <BriefCard title="👑 현재 챔피언" value={champion?.name||'참가 대기'} detail={champion?`누적 수익률 ${signed(champion.rate)}%`:'보유 자산 등록 후 집계'} onClick={champion?()=>onSelectMember(champion.id):undefined}/>
     <BriefCard title="🚀 순위 도약" value={climber?.name||(baseline?'순위 상승 없음':'기록 수집 중')} detail={climber?`${climber.rankDelta}계단 상승 · 현재 ${climber.rank}위`:baseline?'비교 가능한 멤버 기준':'이전 날짜 기록이 필요합니다'} onClick={climber?()=>onSelectMember(climber.id):undefined}/>
     <BriefCard title="🔥 공통 인기 종목" value={popular[0]?.name||'아직 없습니다'} detail={popular[0]?`${popular[0].holders}명이 보유 · 현재 보유 기준`:'주식·코인 보유 기준'}/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
     <div className="rounded-xl bg-slate-950/40 p-4"><h3 className="font-bold text-sm mb-3">멤버별 변화</h3>{changes.length?<div className="space-y-3">{changes.map(m=><button key={m.id} onClick={()=>onSelectMember(m.id)} className="flex w-full items-center justify-between text-left gap-3 rounded-lg hover:bg-slate-800/70 p-1"><span className="text-sm"><span className="mr-2">{m.avatar}</span>{m.name}{m.holdingsChanged&&<span className="block text-[10px] text-amber-300 mt-1">보유 구성 변경 · 매매/수정 영향 포함</span>}</span><span className="text-right"><span className={`block text-sm font-bold ${m.rateDelta>=0?'text-rose-400':'text-blue-400'}`}>{signed(m.rateDelta)}%p</span><span className="text-[10px] text-slate-400">{m.rankDelta>0?`↑ ${m.rankDelta}계단`:m.rankDelta<0?`↓ ${-m.rankDelta}계단`:'순위 유지'} · {m.rank}위</span></span></button>)}</div>:<p className="text-xs text-slate-500">비교 가능한 멤버 기록이 아직 없습니다.</p>}</div>
     <div className="rounded-xl bg-slate-950/40 p-4"><h3 className="font-bold text-sm mb-3">보유 종목 하이라이트</h3>{moves.length?<div className="space-y-3">{[moves[0],...(loser&&loser.id!==moves[0].id?[loser]:[])].map((a,i)=><div key={a.id} className="flex justify-between gap-3 text-sm"><span>{i===0?'📈':'📉'} {a.name}</span><span className={a.change>=0?'text-rose-400':'text-blue-400'}>{signed(a.change)}%</span></div>)}<p className="text-[10px] text-slate-500">비교 시점 모두 보유한 동일 구성 자산의 기록 가격 기준 · 환율 영향 포함 가능</p></div>:<p className="text-xs text-slate-500">동일 구성으로 보유한 종목의 비교 기록을 기다리고 있습니다.</p>}<h3 className="font-bold text-sm mt-5 mb-3">다락방 관심 지도</h3><div className="flex flex-wrap gap-2">{popular.map(p=><span key={p.name} className="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-300">{p.name} <b className="text-amber-300">{p.holders}명</b></span>)}</div></div>
    </div>
    <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">누적 수익률의 변화(%p)이며 입출금·매매를 보정한 기간 투자수익률은 아닙니다. 종목 가격은 장 마감·조회 지연으로 최신 거래 시점과 다를 수 있습니다. 사이트가 열린 동안 서버에 하루 마지막 확인 기록을 저장하며, 접속하지 않은 날은 기록이 비어 있습니다.</p>
   </div>
  </div>
  <div className="px-5 sm:px-6 py-3 bg-slate-950/30 border-t border-slate-800 flex flex-wrap justify-between gap-2 text-[11px] text-slate-400"><span role="status">{status}</span><button onClick={()=>{setStatus('서버 기록 확인 중…');setRetry(n=>n+1);}} className="text-amber-300 hover:text-amber-200">브리핑 새로고침 ↻</button></div>
 </section>;
}
function BriefCard({title,value,detail,onClick}:{title:string;value:string;detail:string;onClick?:()=>void}){const content=<><p className="text-xs text-slate-400">{title}</p><p className="text-lg font-black mt-2">{value}</p><p className="text-xs text-slate-400 mt-1">{detail}</p></>;return onClick?<button onClick={onClick} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 text-left hover:bg-slate-800">{content}</button>:<div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">{content}</div>;}
