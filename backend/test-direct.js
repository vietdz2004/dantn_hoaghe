// Direct test for register endpoint
const http = require('http');

const testData = {
  hoTen: 'Test User Direct',
  email: `direct${Date.now()}@example.com`,
  soDienThoai: '0987654321',
  matKhau: '123456'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/users/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Direct Backend Test...');
console.log('📊 Data:', { ...testData, matKhau: '***' });

const req = http.request(options, (res) => {
  console.log(`📈 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📦 Raw Response:', data);
    try {
      const parsed = JSON.parse(data);
      
      if (res.statusCode === 201 && parsed.success) {
        console.log('🎉 SUCCESS!');
        console.log(`👤 User: ${parsed.data.user.ten}`);
        console.log(`📧 Email: ${parsed.data.user.email}`);
        console.log(`🔑 Token: ${parsed.data.token ? 'Generated' : 'Missing'}`);
      } else {
        console.log('❌ FAILED!');
        console.log('💥 Error Response:', JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.log('❌ Parse Error:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request Error: ${e.message}`);
});

req.write(postData);
req.end(); 