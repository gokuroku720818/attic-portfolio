import { getAssetLinks } from '../utils/stockLinks';
import { Asset } from '../types';

interface Quote {
  name?: string;
  price: number;
  type: Asset['type'];
  currency: 'KRW' | 'USD';
  source: string;
  quotedAt: string;
  collectedAt: string;
}
type QuoteMap = Record<string, Quote>;
const aliases: Record<string,string> = {삼성전자:'005930',SK하이닉스:'000660',하이닉스:'000660',현대차:'005380',카카오:'035720',네이버:'035420',NAVER:'035420',엔솔:'373220',팔란티어:'PLTR',애플:'AAPL',테슬라:'TSLA',엔비디아:'NVDA',마이크로소프트:'MSFT',구글:'GOOGL',아마존:'AMZN',메타:'META',코카콜라:'KO',비트코인:'BTC',이더리움:'ETH',솔라나:'SOL',리플:'XRP',도지코인:'DOGE'};
const normalize = (q:string) => aliases[q.trim()] || q.trim().toUpperCase();
const validNumber = (n:unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;
async function json(url:string) {
  const res = await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(12000)});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
// 매번 최신 수집본 조회. 배포본보다 먼저 갱신되는 main의 원본을 우선 사용한다.
async function loadDynamicPrices():Promise<QuoteMap> {
  try {
    const result=await json(`https://api.github.com/repos/gokuroku720818/attic-portfolio/contents/public/prices.json?ref=main&t=${Date.now()}`);
    if(result.encoding==='base64' && typeof result.content==='string') {
      const bytes=Uint8Array.from(atob(result.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
      const value=JSON.parse(new TextDecoder().decode(bytes));
      if(value && typeof value==='object') return value;
    }
  } catch { /* API 제한 또는 통신 오류 시 원본·배포본 사용 */ }
  for (const url of ['https://raw.githubusercontent.com/gokuroku720818/attic-portfolio/main/public/prices.json','./prices.json']) {
    try { const value=await json(`${url}?t=${Date.now()}`); if(value && typeof value==='object') return value; } catch { /* 다음 출처 */ }
  }
  return {};
}
async function domesticQuotes(assets:Asset[]):Promise<QuoteMap> {
  const codes=[...new Set(assets.filter(a=>a.type==='kr_stock').map(a=>getAssetLinks(a).codeOrSymbol).filter(code=>/^[0-9A-Z]{6}$/.test(code)))];
  const quotes:QuoteMap={};
  await Promise.all(codes.map(async code=>{
    try {
      const data=await json(`https://polling.finance.naver.com/api/realtime/domestic/stock/${code}?t=${Date.now()}`);
      const item=data.datas?.find((row:any)=>row.itemCode===code);
      const price=Number(String(item?.closePrice||'').replace(/,/g,''));
      const time=Date.parse(item?.localTradedAt);
      if(!validNumber(price)||!Number.isFinite(time)||time>Date.now()+60000)return;
      quotes[code]={name:item.stockName,price,type:'kr_stock',currency:'KRW',source:'Naver 직접 조회',quotedAt:new Date(time).toISOString(),collectedAt:new Date().toISOString()};
    } catch { /* 직접 조회 실패 시 검증된 수집본 사용 */ }
  }));
  return quotes;
}
export async function fetchLiveExchangeRate():Promise<number|null> {
  try {const data=await json('https://api.exchangerate-api.com/v4/latest/USD'); return validNumber(data.rates?.KRW)?data.rates.KRW:null;} catch {return null;}
}
async function cryptoQuotes(symbols:string[]):Promise<QuoteMap> {
  const markets=[...new Set(symbols.map(normalize).map(s=>s.startsWith('KRW-')?s:`KRW-${s}`).filter(s=>/^KRW-[A-Z0-9]+$/.test(s)))];
  if(!markets.length) return {};
  try {
    const data=await json(`https://api.upbit.com/v1/ticker?markets=${markets.join(',')}`);
    const out:QuoteMap={};
    for(const item of data) if(validNumber(item.trade_price) && validNumber(item.timestamp)) {
      const q:Quote={price:item.trade_price,type:'crypto',currency:'KRW',source:'Upbit',quotedAt:new Date(item.timestamp).toISOString(),collectedAt:new Date().toISOString()};
      out[item.market]=q;out[item.market.replace('KRW-','')]=q;
    }
    return out;
  } catch {return {};}
}
export async function fetchLiveCryptoPrices():Promise<Record<string,number>> {
  const quotes=await cryptoQuotes(['BTC','ETH','SOL','XRP','DOGE']);
  return Object.fromEntries(Object.entries(quotes).map(([symbol,q])=>[symbol,q.price]));
}
function matchQuote(map:QuoteMap,query:string,type:Asset['type']):Quote|null {
  const q=map[normalize(query)] || map[query.trim()];
  if(!q || q.type!==type || !validNumber(q.price) || !['KRW','USD'].includes(q.currency) || !q.source || !Number.isFinite(Date.parse(q.quotedAt)) || !Number.isFinite(Date.parse(q.collectedAt))) return null;
  // 오래된 수집본을 최신 시세로 적용하지 않는다.
  if(Date.now()-Date.parse(q.collectedAt)>30*60*1000 || Date.parse(q.collectedAt)>Date.now()+60000) return null;
  return q;
}
export async function lookupLiveStockPrice(query:string,type:'kr_stock'|'us_stock'|'crypto'):Promise<{price:number;currency:'KRW'|'USD';name?:string}|null> {
  const map=type==='crypto'?await cryptoQuotes([query]):await loadDynamicPrices();
  const q=matchQuote(map,query,type);if(!q)return null;
  const rate=q.currency==='USD'?((await fetchLiveExchangeRate())??matchQuote(map,'USDKRW=X','cash')?.price??null):1;if(rate===null)return null;
  return {price:q.currency==='USD'?Math.round(q.price*rate):q.price,currency:'KRW',name:q.name};
}
export async function refreshAssetPrices(assets:Asset[]):Promise<Asset[]> {
  const [map,crypto,rate,domestic]=await Promise.all([
    assets.some(a=>a.type==='kr_stock'||a.type==='us_stock')?loadDynamicPrices():Promise.resolve({} as QuoteMap),
    cryptoQuotes(assets.filter(a=>a.type==='crypto').map(a=>a.symbol||a.name)),
    assets.some(a=>a.type==='us_stock'||a.type==='kr_stock')?fetchLiveExchangeRate():Promise.resolve(1),
    domesticQuotes(assets),
  ]);
  const exchangeRate=rate??matchQuote(map,'USDKRW=X','cash')?.price??null;
  return assets.map(asset=>{
    if(asset.type==='real_estate'||asset.type==='cash')return asset;
    const source=asset.type==='crypto'?crypto:map;
    const otherType=asset.type==='kr_stock'?'us_stock':'kr_stock';
    const collected=matchQuote(source,asset.symbol,asset.type)||matchQuote(source,asset.name,asset.type)||(asset.type!=='crypto'?(matchQuote(source,asset.symbol,otherType)||matchQuote(source,asset.name,otherType)):null);
    const direct=asset.type==='kr_stock'?matchQuote(domestic,getAssetLinks(asset).codeOrSymbol,'kr_stock'):null;
    const q=direct&&(!collected||Date.parse(direct.quotedAt)>=Date.parse(collected.quotedAt))?direct:collected;
    if(!q || (q.currency==='USD' && exchangeRate===null))return asset;
    return {...asset,type:q.type,currentPrice:q.currency==='USD'?Math.round(q.price*exchangeRate!):q.price,updatedAt:q.quotedAt,priceSource:q.source,priceFetchedAt:q.collectedAt};
  });
}
