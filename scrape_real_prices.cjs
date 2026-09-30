const https = require('https');
const fs = require('fs');

const KOREAN_STOCKS = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '005380', name: '현대차' },
  { code: '035720', name: '카카오' },
  { code: '035420', name: 'NAVER' },
  { code: '086520', name: '에코프로' },
  { code: '373220', name: 'LG에너지솔루션' },
  { code: '196170', name: '알테오젠' },
  { code: '088980', name: '맥쿼리인프라' },
  { code: '005935', name: '삼성전자우' },
  { code: '068270', name: '셀트리온' },
  { code: '105560', name: 'KB금융' },
  { code: '055550', name: '신한지주' },
  { code: '012330', name: '현대모비스' },
  { code: '000270', name: '기아' },
  { code: '032830', name: '삼성생명' },
  { code: '028260', name: '삼성물산' },
  { code: '051910', name: 'LG화학' },
  { code: '006400', name: '삼성SDI' },
  { code: '247540', name: '에코프로비엠' },
  { code: '360750', name: 'TIGER 미국S&P500' },
];

function fetchNaverStock(code) {
  return new Promise((resolve) => {
    https.get(`https://m.stock.naver.com/api/stock/${code}/basic`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const rawPrice = json.closePrice || json.nowPrice || '0';
          const price = parseInt(rawPrice.replace(/,/g, ''), 10);
          resolve({ code, name: json.stockName, price });
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function scrapeAll() {
  console.log('실제 네이버 시세 수집 중...');
  const results = {};
  for (const item of KOREAN_STOCKS) {
    const res = await fetchNaverStock(item.code);
    if (res && res.price > 0) {
      results[res.code] = { name: res.name, price: res.price, type: 'kr_stock', currency: 'KRW' };
      results[res.name] = { name: res.name, price: res.price, type: 'kr_stock', currency: 'KRW' };
      console.log(`[${res.name} (${res.code})]: ${res.price.toLocaleString()}원`);
    }
  }

  // 미국 주식도 Yahoo Finance에서 최신가 수집
  const US_STOCKS = ['PLTR', 'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'KO'];
  for (const sym of US_STOCKS) {
    try {
      const yfRes = await new Promise((resolve) => {
        https.get(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => {
            try {
              const j = JSON.parse(d);
              resolve(j.chart?.result?.[0]?.meta?.regularMarketPrice);
            } catch (e) { resolve(null); }
          });
        }).on('error', () => resolve(null));
      });

      if (yfRes) {
        results[sym] = { name: sym, price: yfRes, type: 'us_stock', currency: 'USD' };
        console.log(`[미국 ${sym}]: $${yfRes}`);
      }
    } catch (e) {}
  }

  fs.writeFileSync('public/prices.json', JSON.stringify(results, null, 2));
  console.log('public/prices.json 저장 완료!');
}

scrapeAll();
