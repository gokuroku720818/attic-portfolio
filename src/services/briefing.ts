import {Asset, Member} from '../types';
import {calculateRankings} from '../utils/ranking';
import {getAssetLinks} from '../utils/stockLinks';

export type BriefingPeriod='day'|'week'|'month';
export interface BriefingSnapshot {
 version:1; day:string; capturedAt:string;
 members:{id:string;name:string;avatar:string;rank:number;rate:number;holdings:string}[];
 assets:{id:string;memberId:string;name:string;type:Asset['type'];symbol:string;price:number;fingerprint:string;quoteAt?:string}[];
}
export const seoulDay=(date=new Date())=>date.toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
export function shiftDay(day:string,offset:number){const date=new Date(`${day}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10);}
const fingerprint=(a:Asset)=>JSON.stringify([a.memberId,a.type,a.name,a.symbol,a.quantity,a.buyPrice,a.currency]);
export function buildSnapshot(members:Member[],assets:Asset[],date=new Date()):BriefingSnapshot {
 const valid=assets.filter(a=>a.quantity>0&&Number.isFinite(a.currentPrice)&&a.currentPrice>0&&Number.isFinite(a.buyPrice));
 return {version:1,day:seoulDay(date),capturedAt:date.toISOString(),members:calculateRankings(members,valid).map(r=>({id:r.member.id,name:r.member.name,avatar:r.member.avatar,rank:r.rank,rate:r.metrics.profitRate,holdings:JSON.stringify(valid.filter(a=>a.memberId===r.member.id).map(a=>[a.id,fingerprint(a)]).sort())})),assets:valid.map(a=>({id:a.id,memberId:a.memberId,name:a.name,type:a.type,symbol:getAssetLinks(a).codeOrSymbol||a.name,price:a.currentPrice,fingerprint:fingerprint(a),quoteAt:a.priceFetchedAt}))};
}
export function isSnapshot(value:unknown):value is BriefingSnapshot {
 const s=value as BriefingSnapshot;
 return !!s&&s.version===1&&/^\d{4}-\d{2}-\d{2}$/.test(s.day)&&Number.isFinite(Date.parse(s.capturedAt))&&Array.isArray(s.members)&&s.members.every(m=>typeof m.id==='string'&&typeof m.name==='string'&&Number.isFinite(m.rate)&&Number.isFinite(m.rank)&&typeof m.holdings==='string')&&Array.isArray(s.assets)&&s.assets.every(a=>typeof a.id==='string'&&typeof a.memberId==='string'&&typeof a.name==='string'&&typeof a.fingerprint==='string'&&Number.isFinite(a.price)&&a.price>0);
}
export function buildBriefing(input:BriefingSnapshot[],period:BriefingPeriod,today=seoulDay()) {
 const rows=input.filter(isSnapshot).filter(s=>s.day<=today).sort((a,b)=>a.day.localeCompare(b.day));
 const latest=rows.at(-1);
 const target=shiftDay(today,-({day:1,week:7,month:30}[period]));
 // 오래된 기록으로 기간을 늘리지 않는다. 기간 안의 첫 기록만 부분 비교에 사용한다.
 const baseline=rows.find(s=>s.day>=target&&s.day<(latest?.day||today));
 const changes=latest&&baseline?latest.members.flatMap(m=>{const old=baseline.members.find(p=>p.id===m.id);return old?[{...m,rateDelta:m.rate-old.rate,rankDelta:old.rank-m.rank,holdingsChanged:m.holdings!==old.holdings}]:[];}).sort((a,b)=>b.rateDelta-a.rateDelta):[];
 const moves=latest&&baseline?latest.assets.flatMap(a=>{const old=baseline.assets.find(p=>p.id===a.id&&p.fingerprint===a.fingerprint);return old&&['kr_stock','us_stock','crypto'].includes(a.type)?[{...a,change:(a.price/old.price-1)*100}]:[];}).filter((a,i,all)=>all.findIndex(b=>b.type===a.type&&b.symbol===a.symbol)===i).sort((a,b)=>b.change-a.change):[];
 const popular=Object.values((latest?.assets||[]).filter(a=>['kr_stock','us_stock','crypto'].includes(a.type)).reduce<Record<string,{name:string;holders:Set<string>}>>((acc,a)=>{const key=`${a.type}:${a.symbol}`;acc[key]??={name:a.name,holders:new Set()};acc[key].holders.add(a.memberId);return acc;},{})).map(a=>({name:a.name,holders:a.holders.size})).sort((a,b)=>b.holders-a.holders||a.name.localeCompare(b.name)).slice(0,4);
 return {latest,baseline,changes,moves,popular,partial:!baseline||baseline.day!==target,recordDays:rows.filter(s=>s.day>=target).length,target};
}
