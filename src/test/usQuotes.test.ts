import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
const require=createRequire(import.meta.url);
const {selectYahooQuote}=require('../../scrape_real_prices.cjs');
const regular=Date.parse('2026-09-30T20:00:00Z')/1000;
const fixture=(times:number[],prices:(number|null)[])=>({meta:{regularMarketPrice:344,regularMarketTime:regular,shortName:'Alphabet'},timestamp:times,indicators:{quote:[{close:prices}]}});
it('정규장 이후 체결이 있으면 시간외 가격과 실제 시각을 선택한다',()=>{
 expect(selectYahooQuote(fixture([regular,regular+3600],[344,350]),regular+7200)).toMatchObject({price:350,quotedAt:new Date((regular+3600)*1000).toISOString(),source:'Yahoo Finance · 시간외'});
});
it('시간외 마지막 캔들이 비었으면 가장 최근 유효 체결을 선택한다',()=>{
 expect(selectYahooQuote(fixture([regular+3600,regular+3660],[350,null]),regular+7200).price).toBe(350);
});
it('새 체결이 없으면 정규장 실제 가격과 시각을 유지한다',()=>{
 expect(selectYahooQuote(fixture([regular-60],[343]),regular+7200)).toMatchObject({price:344,quotedAt:new Date(regular*1000).toISOString(),source:'Yahoo Finance · 정규장'});
});
it('미래 시각과 0원 캔들은 적용하지 않는다',()=>{
 expect(selectYahooQuote(fixture([regular+60,regular+8000],[0,900]),regular+7200).price).toBe(344);
});
