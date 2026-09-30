const https = require('https');

https.get('https://m.stock.naver.com/api/stock/000660/basic', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('stockName:', json.stockName);
      console.log('closePrice:', json.closePrice);
      console.log('compareToPreviousClosePrice:', json.compareToPreviousClosePrice);
      console.log('전체 키:', Object.keys(json));
      console.log('전체 json snippet:', JSON.stringify(json).slice(0, 500));
    } catch(e) {
      console.error(e);
    }
  });
});
