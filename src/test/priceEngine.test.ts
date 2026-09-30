import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshAssetPrices, lookupLiveStockPrice } from '../services/priceEngine';
import { Asset } from '../types';
const asset: Asset = {id:'a',memberId:'m',type:'kr_stock',name:'삼성전자',symbol:'005930',buyPrice:100,quantity:1,currentPrice:120,currency:'KRW',updatedAt:'2026-01-01T00:00:00Z'};
const at = new Date().toISOString();
const snapshot = (price:number) => ({'005930':{name:'삼성전자',type:'kr_stock',price,currency:'KRW',source:'Naver',quotedAt:at,collectedAt:at}});
function mockFetch(stock:unknown, rate:unknown={rates:{KRW:1400}}) {
 vi.stubGlobal('fetch',vi.fn(async (url:string) => ({ok:true,json:async()=>url.includes('upbit')?[]:url.includes('exchangerate')?rate:stock})));
}
afterEach(()=>vi.unstubAllGlobals());
describe('시세 갱신',()=>{
 it('다시 갱신하면 새 시세 파일을 읽는다',async()=>{
  mockFetch(snapshot(130)); expect((await refreshAssetPrices([asset]))[0].currentPrice).toBe(130);
  mockFetch(snapshot(150)); expect((await refreshAssetPrices([asset]))[0].currentPrice).toBe(150);
 });
 it('수집에 실패하면 고정 가격을 사용하거나 시간을 바꾸지 않는다',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));
  expect((await refreshAssetPrices([asset]))[0]).toEqual(asset);
 });
 it('수집 가격의 실제 기준 시간을 유지한다',async()=>{
  mockFetch(snapshot(130)); expect((await refreshAssetPrices([asset]))[0].updatedAt).toBe(at);
 });
 it('환율에 실패하면 미국 주식 평가액을 유지한다',async()=>{
  mockFetch({TSLA:{price:200,currency:'USD',type:'us_stock',quotedAt:at,collectedAt:at,source:'Yahoo'}},{});
  const us = {...asset,type:'us_stock' as const,symbol:'TSLA',name:'테슬라'};
  expect((await refreshAssetPrices([us]))[0].currentPrice).toBe(us.currentPrice);
 });
 it('다른 자산 유형과 일치하는 이름을 잘못 적용하지 않는다',async()=>{
  mockFetch(snapshot(130)); expect(await lookupLiveStockPrice('삼성전자','crypto')).toBeNull();
 });
 it('부동산과 현금은 그대로 보존한다',async()=>{
  mockFetch(snapshot(130)); const re={...asset,type:'real_estate' as const}; const cash={...asset,type:'cash' as const};
  expect(await refreshAssetPrices([re,cash])).toEqual([re,cash]);
 });
});
it('미국 주식을 국내주식으로 등록했어도 실제 시세 통화로 환산한다',async()=>{
 mockFetch({SOXL:{name:'SOXL',price:100,type:'us_stock',currency:'USD',source:'Yahoo',quotedAt:at,collectedAt:at}});
 const result=(await refreshAssetPrices([{...asset,symbol:'SOXL',name:'SOXL'}]))[0];
 expect(result.currentPrice).toBe(140000);expect(result.type).toBe('us_stock');
});
