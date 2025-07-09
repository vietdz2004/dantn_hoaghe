const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

// Test data
const testOrder = {
  amount: 100000, // 100,000 VND
  orderId: 'TEST_' + Date.now(),
  orderDesc: 'Test payment integration - HoaShop'
};

async function testVNPayPayment() {
  console.log('🧪 Testing VNPay Payment...');
  console.log('📦 Test data:', testOrder);
  
  try {
    const response = await axios.post(`${BASE_URL}/payment/create_payment_url`, testOrder);
    
    console.log('✅ VNPay Response:', {
      success: response.data.success,
      paymentUrl: response.data.paymentUrl ? '✅ Generated' : '❌ Missing',
      debug: response.data.debug
    });
    
    if (response.data.success && response.data.paymentUrl) {
      console.log('🚀 VNPay Payment URL:', response.data.paymentUrl);
      console.log('💡 Copy URL above to test in browser');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ VNPay Test Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
}

async function testZaloPayPayment() {
  console.log('\n🧪 Testing ZaloPay Payment...');
  console.log('📦 Test data:', testOrder);
  
  try {
    const response = await axios.post(`${BASE_URL}/payment/create_zalopay_order`, testOrder);
    
    console.log('✅ ZaloPay Response:', {
      success: response.data.success,
      orderUrl: response.data.order_url ? '✅ Generated' : '❌ Missing',
      appTransId: response.data.app_trans_id,
      debug: response.data.debug
    });
    
    if (response.data.success && response.data.order_url) {
      console.log('🚀 ZaloPay Order URL:', response.data.order_url);
      console.log('💡 Copy URL above to test in browser');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ ZaloPay Test Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
}

async function testPaymentCheck() {
  console.log('\n🧪 Testing Payment Check...');
  
  // Mock VNPay return parameters
  const mockVNPayParams = {
    vnp_ResponseCode: '00',
    vnp_TxnRef: testOrder.orderId,
    vnp_Amount: testOrder.amount * 100,
    vnp_TransactionNo: '12345678',
    vnp_BankCode: 'NCB',
    vnp_PayDate: '20241220123456',
    paymentMethod: 'vnpay'
  };
  
  try {
    const queryString = new URLSearchParams(mockVNPayParams).toString();
    const response = await axios.get(`${BASE_URL}/payment/check_payment?${queryString}`);
    
    console.log('✅ Payment Check Response:', {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Payment Check Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Payment Integration Tests...\n');
  
  // Test VNPay
  const vnpayResult = await testVNPayPayment();
  
  // Test ZaloPay
  const zalopayResult = await testZaloPayPayment();
  
  // Test Payment Check
  const checkResult = await testPaymentCheck();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('VNPay:', vnpayResult?.success ? '✅ PASS' : '❌ FAIL');
  console.log('ZaloPay:', zalopayResult?.success ? '✅ PASS' : '❌ FAIL');
  console.log('Payment Check:', checkResult?.success ? '✅ PASS' : '❌ FAIL');
  
  if (vnpayResult?.success && zalopayResult?.success) {
    console.log('\n🎉 All payment tests passed! Integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testVNPayPayment,
  testZaloPayPayment,
  testPaymentCheck,
  runAllTests
}; 