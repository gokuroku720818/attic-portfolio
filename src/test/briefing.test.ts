import {describe,it,expect} from 'vitest';
import {buildSnapshot,buildBriefing,seoulDay} from '../services/briefing';
import {Asset,Member} from '../types';
const members=[{id:'m',name:'명왕',pin:'secret',avatar:'👑',bio:'',updatedAt:''}] as Member[];
const asset={id:'a',memberId:'m',type:'kr_stock',name:'삼성전자',symbol:'005930',buyPrice:100,quantity:1,currentPrice:100,currency:'KRW',updatedAt:''} as Asset;
const snapshot=(date:string,price:number)=>buildSnapshot(members,[{...asset,currentPrice:price}],new Date(date));
describe('서버 브리핑',()=>{
 it('한국 날짜 경계를 사용하고 PIN을 기록하지 않는다',()=>{expect(seoulDay(new Date('2026-09-30T16:00:00Z'))).toBe('2026-10-01');expect(JSON.stringify(snapshot('2026-09-30',100))).not.toContain('secret');});
 it('전날 대비 누적수익률 변화와 가격 변화를 분리한다',()=>{const b=buildBriefing([snapshot('2026-09-29',100),snapshot('2026-09-30',110)],'day','2026-09-30');expect(b.changes[0].rateDelta).toBeCloseTo(10);expect(b.moves[0].change).toBeCloseTo(10);expect(b.baseline?.day).toBe('2026-09-29');});
 it('과거 기록이 없으면 비교 수치를 만들지 않는다',()=>{const b=buildBriefing([snapshot('2026-09-30',110)],'week','2026-09-30');expect(b.changes).toEqual([]);expect(b.moves).toEqual([]);expect(b.partial).toBe(true);});
 it('7일 기준 기록이 없으면 실제 첫 기록부터의 부분 기간을 표시한다',()=>{const b=buildBriefing([snapshot('2026-09-26',100),snapshot('2026-09-30',110)],'week','2026-09-30');expect(b.baseline?.day).toBe('2026-09-26');expect(b.partial).toBe(true);});
 it('보유 구성이 달라지면 표시하고 해당 자산 가격 비교를 제외한다',()=>{const old=snapshot('2026-09-29',100),now=buildSnapshot(members,[{...asset,quantity:2,currentPrice:110}],new Date('2026-09-30'));const b=buildBriefing([old,now],'day','2026-09-30');expect(b.changes[0].holdingsChanged).toBe(true);expect(b.moves).toEqual([]);});
 it('미래 기록을 제외하고 동일 종목 중복 보유는 회원 수로 집계한다',()=>{const now=buildSnapshot(members,[asset,{...asset,id:'b'}],new Date('2026-09-30'));const b=buildBriefing([now,snapshot('2026-10-01',200)],'month','2026-09-30');expect(b.latest?.day).toBe('2026-09-30');expect(b.popular[0].holders).toBe(1);});
});
