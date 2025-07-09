const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');
const axios = require('axios');
const Order = require('../models/Order');

// VNPay Configuration
const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_HASHSECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURNURL;

// ZaloPay Configuration
const zaloConfig = {
  app_id: process.env.ZALOPAY_APP_ID || "2553",
  key1: process.env.ZALOPAY_KEY1 || "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: process.env.ZALOPAY_KEY2 || "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  callback_url: process.env.ZALOPAY_CALLBACK_URL || "http://localhost:5002/api/payment/zalopay_callback"
};

// Tạo link thanh toán VNPay
router.post('/create_payment_url', async (req, res) => {
  try {
    const ipAddr = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   '127.0.0.1';
    
    const { amount, orderId, orderDesc, bankCode, payType } = req.body;

    // Validation
    if (!amount || !orderId || !orderDesc) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: amount, orderId, orderDesc'
      });
    }

    // Kiểm tra VNPay config
    if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
      console.error('❌ VNPay config missing:', {
        vnp_TmnCode: !!vnp_TmnCode,
        vnp_HashSecret: !!vnp_HashSecret,
        vnp_Url: !!vnp_Url,
        vnp_ReturnUrl: !!vnp_ReturnUrl
      });
      return res.status(500).json({
        success: false,
        message: 'VNPay configuration error'
      });
    }

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId.toString(),
      vnp_OrderInfo: orderDesc,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(amount * 100), // VNPay yêu cầu x100 và là số nguyên
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };
    
    if (bankCode) vnp_Params.vnp_BankCode = bankCode;
    if (payType) vnp_Params.vnp_PayType = payType;

    // Log tham số gửi lên VNPay để debug
    console.log('🏦 VNPay Request Params:', {
      ...vnp_Params,
      vnp_HashSecret: '***HIDDEN***'
    });

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    console.log('🔐 VNPay signData:', signData);
    
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    console.log('✅ VNPay signature:', signed);
    
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params, { encode: true })}`;
    console.log('🚀 VNPay Payment URL generated successfully');
    
    res.json({ 
      success: true,
      paymentUrl,
      debug: process.env.NODE_ENV === 'development' ? {
        amount: amount,
        vnp_Amount: vnp_Params.vnp_Amount,
        orderId: orderId,
        createDate: createDate
      } : undefined
    });
  } catch (error) {
    console.error('❌ VNPay create payment URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo link thanh toán VNPay',
      error: error.message
    });
  }
});

// Tạo link thanh toán ZaloPay
router.post('/create_zalopay_order', async (req, res) => {
  try {
    const { amount, orderId, orderDesc } = req.body;

    // Validation
    if (!amount || !orderId || !orderDesc) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: amount, orderId, orderDesc'
      });
    }

    const transID = Math.floor(Math.random() * 1000000);
    const items = [{}];

    const embed_data = {
      preferred_payment_method: ["international_card"],
      redirecturl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-result?paymentMethod=zalopay`
    };

    const order = {
      app_id: zaloConfig.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
      app_user: "user123",
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: orderDesc,
      bank_code: "",
      callback_url: zaloConfig.callback_url,
    };

    const data = 
      zaloConfig.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;

    // Tạo MAC (Message Authentication Code)
    order.mac = crypto.createHmac('sha256', zaloConfig.key1).update(data).digest('hex');

    console.log('🟡 ZaloPay Request:', {
      ...order,
      key1: '***HIDDEN***'
    });

    const response = await axios.post(zaloConfig.endpoint, null, { params: order });
    
    console.log('✅ ZaloPay Response:', response.data);

    res.json({
      success: true,
      order_url: response.data.order_url,
      app_trans_id: order.app_trans_id,
      debug: process.env.NODE_ENV === 'development' ? {
        amount: amount,
        orderId: orderId,
        transID: transID
      } : undefined
    });

  } catch (error) {
    console.error('❌ ZaloPay create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo đơn hàng ZaloPay',
      error: error.message
    });
  }
});

// Xác nhận thanh toán VNPay (callback)
router.get('/vnpay_return', async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const signData = qs.stringify(sortObject(vnp_Params), { encode: false });
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    console.log('🔍 VNPay Return - Response Code:', vnp_Params['vnp_ResponseCode']);
    console.log('🔍 VNPay Return - Order ID:', vnp_Params['vnp_TxnRef']);

    if (secureHash === signed) {
      // Xác thực thành công
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        // Thanh toán thành công, cập nhật trạng thái đơn hàng
        const orderId = vnp_Params['vnp_TxnRef'];
        await Order.update(
          { trangThaiDonHang: 'DA_THANH_TOAN', phuongThucThanhToan: 'VNPay' },
          { where: { id_DonHang: orderId } }
        );
        console.log('✅ VNPay payment successful for order:', orderId);
        // Redirect về frontend với trạng thái thành công
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-result?status=success&orderId=${orderId}&paymentMethod=vnpay`);
      } else {
        // Thanh toán thất bại
        console.log('❌ VNPay payment failed:', vnp_Params['vnp_ResponseCode']);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-result?status=fail&reason=${vnp_Params['vnp_ResponseCode']}&paymentMethod=vnpay`);
      }
    } else {
      // Sai chữ ký
      console.log('❌ VNPay invalid signature');
      return res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('❌ VNPay return error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-result?status=error&message=server_error&paymentMethod=vnpay`);
  }
});

// ZaloPay callback
router.post('/zalopay_callback', async (req, res) => {
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = crypto.createHmac('sha256', zaloConfig.key2).update(dataStr).digest('hex');
    console.log("🔍 ZaloPay callback - MAC:", mac);

    // Kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // Callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
      console.log('❌ ZaloPay callback - Invalid MAC');
    } else {
      // Thanh toán thành công
      // Merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr);
      console.log("✅ ZaloPay callback - Update order status:", dataJson["app_trans_id"]);

      // TODO: Cập nhật trạng thái đơn hàng trong database
      // await Order.update(
      //   { trangThaiDonHang: 'DA_THANH_TOAN', phuongThucThanhToan: 'ZaloPay' },
      //   { where: { app_trans_id: dataJson["app_trans_id"] } }
      // );

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
    console.error('❌ ZaloPay callback error:', ex);
  }

  // Thông báo kết quả cho ZaloPay server
  res.json(result);
});

// Kiểm tra trạng thái thanh toán (cho frontend)
router.get('/check_payment', async (req, res) => {
  try {
    const query = req.query;
    const paymentMethod = query.paymentMethod;

    if (paymentMethod === 'vnpay') {
      const vnp_SecureHash = query.vnp_SecureHash;
      delete query.vnp_SecureHash;
      delete query.vnp_SecureHashType;

      const signData = qs.stringify(sortObject(query), { encode: false });
      const hmac = crypto.createHmac('sha512', vnp_HashSecret);
      const checkSum = hmac.update(signData).digest('hex');

      if (vnp_SecureHash === checkSum) {
        if (query.vnp_ResponseCode === '00') {
          res.json({ 
            success: true,
            message: "Thanh toán thành công", 
            data: query 
          });
        } else {
          res.json({ 
            success: false,
            message: "Thanh toán thất bại", 
            data: query 
          });
        }
      } else {
        res.status(400).json({ 
          success: false,
          message: "Dữ liệu không hợp lệ" 
        });
      }
    } else if (paymentMethod === 'zalopay') {
      // Xử lý check ZaloPay status
      const status = query.status;
      if (Number(status) === 1) {
        res.json({ 
          success: true,
          message: "Thanh toán thành công", 
          data: query 
        });
      } else {
        res.json({ 
          success: false,
          message: "Khách hàng hủy thanh toán", 
          data: query 
        });
      }
    } else {
      res.status(400).json({ 
        success: false,
        message: "Phương thức thanh toán không hợp lệ" 
      });
    }
  } catch (error) {
    console.error('❌ Check payment error:', error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi kiểm tra thanh toán",
      error: error.message 
    });
  }
});

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

module.exports = router; 