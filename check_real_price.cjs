const https = require('https');

https.get('https://m.stock.naver.com/api/stock/000660/basic', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('실제 SK하이닉스 시세:', json.stockName, 'nowPrice:', json.nowPrice, 'closePrice:', json.closePrice);
    } catch(e) {
      console.error('파싱 실패:', e);
    }
  });
}).on('error', console.error);
