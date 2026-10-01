const fs=require('node:fs');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const run=promisify(execFile);
// 공개 시세 목록만 수집한다. 개인 포트폴리오나 클라우드 DB는 읽지 않는다.
async function get(url){const {stdout}=await run('curl',['--fail','--silent','--show-error','--location','--max-time','12','--retry','1','-A','Mozilla/5.0',url],{maxBuffer:2*1024*1024});return JSON.parse(stdout);}
// 정규장 메타 가격과 시간외 포함 1분봉을 실제 체결 시각으로 비교한다.
function selectYahooQuote(result,now=Date.now()/1000){
 const m=result?.meta;
 const valid=(price,time)=>Number.isFinite(price)&&price>0&&Number.isFinite(time)&&time>0&&time<=now+60;
 let price=m?.regularMarketPrice,time=m?.regularMarketTime,source='Yahoo Finance · 정규장';
 if(!valid(price,time)){price=undefined;time=0;}
 const closes=result?.indicators?.quote?.[0]?.close||[];
 for(let i=0;i<(result?.timestamp?.length||0);i++){
  const t=result.timestamp[i],p=closes[i];
  if(valid(p,t)&&t>time){price=p;time=t;source=t>m?.regularMarketTime?'Yahoo Finance · 시간외':'Yahoo Finance · 정규장';}
 }
 if(!valid(price,time))throw new Error('invalid Yahoo quote');
 return {name:m?.shortName,price,quotedAt:new Date(time*1000).toISOString(),source};
}
async function scrapeAll(){
 const previous=JSON.parse(fs.readFileSync('public/prices.json','utf8'));
 const results={...previous};let successes=0,failures=0;
 for(const [symbol,old] of Object.entries(previous)){
  if(!((old.type==='kr_stock'&&/^[0-9A-Z]{6}$/.test(symbol))||(old.type==='us_stock'&&/^[A-Z][A-Z0-9.^=-]{0,14}$/.test(symbol))))continue;
  try{
   let name,price,quotedAt,source;
   if(old.type==='kr_stock'){
    const j=await get(`https://m.stock.naver.com/api/stock/${symbol}/basic`);
    name=j.stockName;price=Number(String(j.closePrice||j.nowPrice).replaceAll(',',''));quotedAt=j.localTradedAt;source='Naver';
   }else{
    const j=await get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d&includePrePost=true`);
    const q=selectYahooQuote(j.chart?.result?.[0]);name=q.name||symbol;price=q.price;quotedAt=q.quotedAt;source=q.source;
   }
   if(typeof price!=='number'||!Number.isFinite(price)||price<=0||!Number.isFinite(Date.parse(quotedAt)))throw new Error('invalid quote');
   const q={name,price,type:old.type,currency:old.currency,source,quotedAt:new Date(quotedAt).toISOString(),collectedAt:new Date().toISOString()};
   results[symbol]=q;results[name]=q;
   for(const [alias,entry] of Object.entries(previous))if(entry.type===old.type&&entry.name===old.name)results[alias]=q;
   successes++;
  }catch{failures++;console.warn(`시세 수집 실패: ${symbol} (기존 가격과 시각 유지)`);}
 }
 // 브라우저의 환율 API 장애가 해외 종목 전체 갱신을 막지 않도록 공개 환율도 수집한다.
 try{
  const j=await get('https://query1.finance.yahoo.com/v8/finance/chart/USDKRW%3DX?interval=1d&range=5d');
  const q=selectYahooQuote(j.chart?.result?.[0]);
  results['USDKRW=X']={...q,name:'USD/KRW',type:'cash',currency:'KRW',collectedAt:new Date().toISOString()};
 }catch{console.warn('환율 수집 실패: 기존 환율과 시각 유지');}
 if(!successes)throw new Error('모든 시세 수집 실패');
 fs.writeFileSync('public/prices.json.tmp',JSON.stringify(results,null,2)+'\n');fs.renameSync('public/prices.json.tmp','public/prices.json');
 console.log(`시세 수집: 성공 ${successes}, 실패 ${failures}`);
}
if(require.main===module)scrapeAll().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={scrapeAll,selectYahooQuote};
