import {Asset} from '../types';
import {instrumentNames} from '../data/instrumentNames';
interface Links {naverUrl:string;tossUrl?:string;upbitUrl?:string;codeOrSymbol:string}
const aliases:Record<string,string>={하이닉스:'000660',SK하이닉스:'000660',삼성전자:'005930',엔솔:'373220',네이버:'035420',구글:'GOOGL',애플:'AAPL',테슬라:'TSLA',팔란티어:'PLTR',엔비디아:'NVDA',마이크로소프트:'MSFT',아마존:'AMZN',메타:'META',코카콜라:'KO',비트코인:'BTC',이더리움:'ETH',솔라나:'SOL',리플:'XRP',도지코인:'DOGE'};
const instruments=instrumentNames;
export function getAssetLinks(asset:Pick<Asset,'name'|'symbol'|'type'>):Links {
 const name=asset.name.trim();let code=asset.symbol.trim().toUpperCase();
 if(['','CUSTOM','TEMP','RE'].includes(code))code=aliases[name]||instruments.find(([symbol,stockName])=>stockName===name||symbol===name.toUpperCase())?.[0]||'';
 if(asset.type==='real_estate')return {naverUrl:`https://m.land.naver.com/search/result/${encodeURIComponent(name)}`,codeOrSymbol:'부동산'};
 if(asset.type==='crypto')return {naverUrl:`https://search.naver.com/search.naver?query=${encodeURIComponent(name+' 코인 시세')}`,upbitUrl:code?`https://upbit.com/exchange?code=CRIX.UPBIT.KRW-${code.replace(/^KRW-/,'')}`:undefined,codeOrSymbol:code};
 if(/^[0-9A-Z]{6}$/.test(code))return {naverUrl:`https://m.stock.naver.com/domestic/stock/${code}/total`,tossUrl:`https://tossinvest.com/stocks/A${code}`,codeOrSymbol:code};
 if(/^[A-Z]{1,5}$/.test(code))return {naverUrl:`https://m.stock.naver.com/worldstock/stock/${code}/total`,tossUrl:`https://tossinvest.com/stocks/${code}`,codeOrSymbol:code};
 return {naverUrl:`https://m.stock.naver.com/search?keyword=${encodeURIComponent(name)}`,tossUrl:`https://tossinvest.com/search?q=${encodeURIComponent(name)}`,codeOrSymbol:code||name};
}
