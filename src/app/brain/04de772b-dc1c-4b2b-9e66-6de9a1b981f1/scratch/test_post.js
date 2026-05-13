const http = require('http');

const data = JSON.stringify({
  name: "Test Category " + Date.now(),
  slug: "test-cat-" + Date.now(),
  type: "product",
  linkedItems: ["6a032e9cbf2531e05f02de4c"] // A product ID we saw earlier
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/categories',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let resData = '';
  res.on('data', chunk => resData += chunk);
  res.on('end', () => console.log('Response:', resData));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
