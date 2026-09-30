import { Asset } from '../types';
// 가격 필드만 병합하여 조회 중 발생한 등록·삭제·수량 변경을 보존한다.
export function mergePriceUpdates(current:Asset[],original:Asset[],updated:Asset[]):Asset[] {
 const before=new Map(original.map(a=>[a.id,a]));const after=new Map(updated.map(a=>[a.id,a]));
 return current.map(a=>{
  const old=before.get(a.id),q=after.get(a.id);
  if(!old||!q||q===old||a.symbol!==old.symbol||a.type!==old.type||a.memberId!==old.memberId||a.name!==old.name)return a;
  if(a.priceFetchedAt&&q.priceFetchedAt&&Date.parse(a.priceFetchedAt)>Date.parse(q.priceFetchedAt))return a;
  return {...a,type:q.type,currentPrice:q.currentPrice,updatedAt:q.updatedAt,priceSource:q.priceSource,priceFetchedAt:q.priceFetchedAt};
 });
}
