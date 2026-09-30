import {BriefingSnapshot,isSnapshot,seoulDay,shiftDay} from './briefing';
export const ACHIEVEMENTS=[
 {id:'first-record',emoji:'🌱',name:'다락방 입문',description:'보유 포트폴리오가 서버에 처음 기록되면 달성합니다.'},
 {id:'first-profit',emoji:'✨',name:'첫 수익의 맛',description:'누적 수익률이 0%보다 높은 서버 기록을 남기면 달성합니다.'},
 {id:'comeback',emoji:'🌈',name:'다시 봄날',description:'보유 구성이 같은 연속 날짜 기록에서 마이너스·0% → 플러스로 전환하면 달성합니다.'},
 {id:'first-champion',emoji:'👑',name:'왕좌에 앉다',description:'2명 이상 참가한 서버 기록에서 수익률 1위를 달성합니다.'},
 {id:'streak-7',emoji:'🔥',name:'꾸준함의 불꽃',description:'포트폴리오가 한국 날짜 기준 7일 연속 서버에 기록되면 달성합니다.'},
 {id:'records-30',emoji:'📚',name:'투자 기록가',description:'서로 다른 30일의 포트폴리오 서버 기록을 모으면 달성합니다.'},
] as const;
export type AchievementId=typeof ACHIEVEMENTS[number]['id'];
export interface EarnedAchievement {version:1;memberId:string;id:AchievementId;day:string}
export function isEarnedAchievement(value:unknown):value is EarnedAchievement {
 const a=value as EarnedAchievement;
 return !!a&&a.version===1&&typeof a.memberId==='string'&&ACHIEVEMENTS.some(d=>d.id===a.id)&&/^\d{4}-\d{2}-\d{2}$/.test(a.day);
}
export function normalizedAchievementRows(input:BriefingSnapshot[],today=seoulDay()) {
 const byDay=new Map<string,BriefingSnapshot>();
 for(const row of input.filter(isSnapshot).filter(s=>s.day<=today)) {const old=byDay.get(row.day);if(!old||row.capturedAt>old.capturedAt)byDay.set(row.day,row);}
 return [...byDay.values()].sort((a,b)=>a.day.localeCompare(b.day));
}
export function evaluateAchievements(input:BriefingSnapshot[],today=seoulDay()):EarnedAchievement[] {
 const earned=new Map<string,EarnedAchievement>();
 const states=new Map<string,{day:string;rate:number;holdings:string;streak:number;count:number}>();
 const award=(memberId:string,id:AchievementId,day:string)=>{const key=`${memberId}:${id}`;if(!earned.has(key))earned.set(key,{version:1,memberId,id,day});};
 for(const row of normalizedAchievementRows(input,today)) {
  for(const member of row.members) {
   const previous=states.get(member.id);
   const adjacent=previous?.day===shiftDay(row.day,-1);
   const streak=adjacent?previous.streak+1:1;
   const count=(previous?.count||0)+1;
   award(member.id,'first-record',row.day);
   if(member.rate>0)award(member.id,'first-profit',row.day);
   if(member.rank===1&&row.members.length>=2)award(member.id,'first-champion',row.day);
   if(adjacent&&previous.rate<=0&&member.rate>0&&previous.holdings===member.holdings)award(member.id,'comeback',row.day);
   if(streak>=7)award(member.id,'streak-7',row.day);
   if(count>=30)award(member.id,'records-30',row.day);
   states.set(member.id,{day:row.day,rate:member.rate,holdings:member.holdings,streak,count});
  }
 }
 return [...earned.values()];
}
export function achievementProgress(rows:BriefingSnapshot[],memberId:string,today=seoulDay()) {
 const dates=normalizedAchievementRows(rows,today).filter(r=>r.members.some(m=>m.id===memberId)).map(r=>r.day);
 let streak=0;
 let cursor=dates.at(-1);
 if(cursor&&cursor>=shiftDay(today,-1)) {const set=new Set(dates);while(set.has(cursor)){streak++;cursor=shiftDay(cursor,-1);}}
 return {days:dates.length,streak};
}
