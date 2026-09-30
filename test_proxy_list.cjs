const https = require('https');

async function testUrl(name, url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ name, status: res.statusCode, data: data.slice(0, 150) });
      });
    });
    req.on('error', (e) => resolve({ name, error: e.message }));
    req.setTimeout(4000, () => { req.destroy(); resolve({ name, error: 'timeout' }); });
  });
}

async function run() {
  const target = encodeURIComponent('https://m.stock.naver.com/api/stock/000660/basic');
  const results = await Promise.all([
    testUrl('corsproxy.org', `https://corsproxy.org/?url=${target}`),
    testUrl('codetabs', `https://api.codetabs.com/v1/proxy?quest=${target}`),
    testUrl('allorigins_get', `https://api.allorigins.win/get?url=${target}`),
    testUrl('cors_workers', `https://cors-anywhere.azm.workers.dev/${target}`),
  ]);
  console.log(JSON.stringify(results, null, 2));
}

run();
