import {useAtticStore} from '../context/AtticContext';
import {useAchievements} from '../context/AchievementContext';
import {ACHIEVEMENTS,achievementProgress} from '../services/achievements';
export function AchievementHall({onSelectMember}:{onSelectMember:(id:string)=>void}) {
 const {members,rankedMembers}=useAtticStore();
 const {earned,status}=useAchievements();
 const rows=members.filter(m=>rankedMembers.some(r=>r.member.id===m.id)||earned.some(e=>e.memberId===m.id)).map(m=>({member:m,awards:earned.filter(e=>e.memberId===m.id)})).sort((a,b)=>b.awards.length-a.awards.length||a.member.name.localeCompare(b.member.name));
 return <section aria-label="다락방 업적 전당" className="rounded-2xl bg-slate-900/70 border border-amber-500/20 p-5">
  <div className="flex flex-wrap justify-between items-center gap-2"><div><h2 className="font-black text-lg">🏅 다락방 업적 전당</h2><p className="text-xs text-slate-400 mt-1">순위는 바뀌어도, 달성한 업적은 남습니다.</p></div><span className="text-xs text-amber-300">수집할 업적 {ACHIEVEMENTS.length}개</span></div>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">{rows.map(({member,awards})=><button key={member.id} onClick={()=>onSelectMember(member.id)} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3 text-left hover:border-amber-500/50 transition-colors"><div className="flex justify-between gap-2"><span className="text-sm font-bold">{member.avatar} {member.name}</span><span className="text-xs text-amber-300">{awards.length}/{ACHIEVEMENTS.length}</span></div><div className="flex flex-wrap gap-2 mt-3">{ACHIEVEMENTS.map(a=><span key={a.id} title={`${a.name}: ${awards.some(e=>e.id===a.id)?'달성':'미달성'}`} className={`text-lg ${awards.some(e=>e.id===a.id)?'':'grayscale opacity-25'}`}>{a.emoji}</span>)}</div><span className="text-[10px] text-slate-500 block mt-2">업적 수집판 보기 →</span></button>)}</div>
  {!rows.length&&<p className="text-sm text-slate-400 mt-4">포트폴리오를 등록하고 첫 기록 업적에 도전해 보세요.</p>}
  <p role="status" className="text-[10px] text-slate-500 mt-3">{status} · 서버 기록으로 판정 · 투자 실력 점수가 아닙니다.</p>
 </section>;
}
export function MemberAchievements({memberId}:{memberId:string}) {
 const {earned,snapshots,status}=useAchievements();
 const awards=earned.filter(a=>a.memberId===memberId);
 const progress=achievementProgress(snapshots,memberId);
 return <section aria-label="업적 수집판" className="mt-5 rounded-2xl border border-amber-500/20 p-4 bg-amber-500/[0.03]">
  <div className="flex justify-between"><h3 className="font-black text-sm">🏅 업적 수집판</h3><span className="text-xs text-amber-300">{awards.length} / {ACHIEVEMENTS.length} 달성</span></div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">{ACHIEVEMENTS.map(a=>{const award=awards.find(e=>e.id===a.id);const count=a.id==='streak-7'?Math.min(progress.streak,7):a.id==='records-30'?Math.min(progress.days,30):0;const target=a.id==='streak-7'?7:30;return <div key={a.id} className={`rounded-xl p-3 border ${award?'border-amber-500/40 bg-amber-500/10':'border-slate-700/50 bg-slate-800/30'}`}><div className="flex gap-2 items-center"><span className={`text-2xl ${award?'':'grayscale opacity-40'}`}>{a.emoji}</span><div><h4 className={`text-xs font-bold ${award?'text-amber-200':'text-slate-400'}`}>{a.name}</h4><p className="text-[10px] text-slate-500">{award?`달성 · ${award.day}`:'🔒 아직 미달성'}</p></div></div><p className="text-[10px] leading-relaxed text-slate-400 mt-2">{a.description}</p>{!award&&['streak-7','records-30'].includes(a.id)&&<><div role="progressbar" aria-label={`${a.name} 진행률`} aria-valuenow={count} aria-valuemin={0} aria-valuemax={target} className="h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width:`${count/target*100}%`}}/></div><p className="text-[10px] text-slate-500 mt-1">{count}/{target}일{a.id==='streak-7'?' · 현재 연속 기록':''}</p></>}</div>;})}</div>
  <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">{status} · 2026-09-30부터 수집한 기록 기준이며 그 이전 이력은 소급하지 않습니다. 기록 업적은 개인 접속 횟수가 아닌 포트폴리오 기록일을 셉니다. 구성 변경으로 수익률이 바뀌는 경우도 있으므로 업적은 투자 성과 인증이 아닙니다.</p>
 </section>;
}
