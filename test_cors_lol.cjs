const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data.slice(0, 200) });
      });
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

async function test() {
  const target = encodeURIComponent('https://m.stock.naver.com/api/stock/000660/basic');
  const r = await testUrl(`https://api.cors.lol/?url=${target}`);
  console.log('cors.lol:', r);
}

test();
