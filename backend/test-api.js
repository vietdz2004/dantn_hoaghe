const axios = require('axios');

async function testCategoriesAPI() {
  console.log('🧪 Testing Categories API...');
  
  try {
    // Test basic categories endpoint
    console.log('\n1️⃣ Testing /api/categories');
    const basicResponse = await axios.get('http://localhost:5000/api/categories');
    console.log('✅ Basic categories response:', basicResponse.status);
    console.log('📊 Categories count:', basicResponse.data?.data?.length || 0);
    
    // Test with-products endpoint
    console.log('\n2️⃣ Testing /api/categories/with-products');
    const productsResponse = await axios.get('http://localhost:5000/api/categories/with-products');
    console.log('✅ With-products response:', productsResponse.status);
    console.log('📊 Categories with products count:', productsResponse.data?.data?.length || 0);
    console.log('📋 Response data:', JSON.stringify(productsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Error:');
    console.error('📛 Message:', error.message);
    if (error.response) {
      console.error('📛 Status:', error.response.status);
      console.error('📛 Data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Backend server is not running on port 5000');
    }
  }
}

testCategoriesAPI(); 