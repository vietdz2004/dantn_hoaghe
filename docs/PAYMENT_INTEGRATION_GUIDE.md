# 🏦 Hướng dẫn tích hợp thanh toán VNPay & ZaloPay

## 📋 Tổng quan

Hệ thống HoaShop đã được tích hợp đầy đủ thanh toán online với **VNPay** và **ZaloPay**, dựa trên code mẫu từ `payment_onl`.

## 🚀 Tính năng đã tích hợp

### ✅ Backend (Express + MySQL)
- **VNPay Integration**: Tạo link thanh toán, xác thực callback, kiểm tra kết quả
- **ZaloPay Integration**: Tạo đơn hàng, xử lý callback, kiểm tra trạng thái
- **Unified API**: API thống nhất cho cả hai phương thức thanh toán
- **Error Handling**: Xử lý lỗi chi tiết với logging
- **Security**: Xác thực chữ ký HMAC SHA512 (VNPay) và SHA256 (ZaloPay)

### ✅ Frontend (React)
- **Multi-step Checkout**: Form thanh toán 4 bước
- **Payment Method Selection**: Chọn VNPay, ZaloPay hoặc COD
- **Payment Result Page**: Hiển thị kết quả thanh toán đẹp mắt
- **Error Handling**: Xử lý lỗi và thông báo user-friendly

## 🔧 Cấu hình

### Backend Environment Variables (`backend/config.env`)

```env
# ========== VNPAY CONFIG ==========
VNP_TMNCODE=your_tmn_code
VNP_HASHSECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURNURL=https://your-domain.ngrok-free.app/api/payment/vnpay_return
VNP_IPNURL=https://your-domain.ngrok-free.app/api/payment/vnpay_ipn

# ========== ZALOPAY CONFIG ==========
ZALOPAY_APP_ID=2553
ZALOPAY_KEY1=PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL
ZALOPAY_KEY2=kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz
ZALOPAY_CALLBACK_URL=https://your-domain.ngrok-free.app/api/payment/zalopay_callback

# ========== FRONTEND ==========
FRONTEND_URL=http://localhost:3000
```

### Dependencies

```bash
# Backend
npm install moment axios

# Frontend (đã có sẵn)
# @mui/material, @mui/icons-material, react-router-dom
```

## 🔄 Flow thanh toán

### 1. VNPay Flow
```
Frontend → Tạo đơn hàng → Gọi /payment/create_payment_url → Redirect VNPay → Callback → Payment Result Page
```

### 2. ZaloPay Flow
```
Frontend → Tạo đơn hàng → Gọi /payment/create_zalopay_order → Redirect ZaloPay → Callback → Payment Result Page
```

## 📡 API Endpoints

### Backend Routes (`backend/routes/paymentRoutes.js`)

#### VNPay
- `POST /api/payment/create_payment_url` - Tạo link thanh toán VNPay
- `GET /api/payment/vnpay_return` - Callback từ VNPay
- `GET /api/payment/check_payment` - Kiểm tra kết quả VNPay

#### ZaloPay
- `POST /api/payment/create_zalopay_order` - Tạo đơn hàng ZaloPay
- `POST /api/payment/zalopay_callback` - Callback từ ZaloPay

### Frontend Routes
- `/checkout` - Trang thanh toán
- `/payment-result` - Trang kết quả thanh toán

## 💳 Sử dụng

### 1. Chọn phương thức thanh toán
Trong trang checkout, user có thể chọn:
- **COD**: Thanh toán khi nhận hàng
- **VNPay**: Thanh toán qua VNPay (ATM, QR, thẻ quốc tế)
- **ZaloPay**: Thanh toán qua ZaloPay (Ví điện tử, thẻ ATM)

### 2. Quá trình thanh toán
1. User điền thông tin khách hàng
2. User nhập địa chỉ giao hàng
3. User chọn phương thức thanh toán
4. User xác nhận đơn hàng
5. Hệ thống tạo đơn hàng trong database
6. Nếu chọn online payment:
   - Tạo link thanh toán (VNPay/ZaloPay)
   - Redirect user đến trang thanh toán
   - Sau khi thanh toán, redirect về payment-result
7. Nếu chọn COD: Chuyển đến trang thành công

### 3. Kết quả thanh toán
- **Thành công**: Hiển thị thông tin giao dịch, mã đơn hàng
- **Thất bại**: Hiển thị lý do thất bại, hướng dẫn liên hệ

## 🛠️ Development

### Chạy Backend
```bash
cd backend
npm install
npm start
```

### Chạy Frontend
```bash
cd frontend
npm install
npm run dev
```

### Ngrok (cho callback)
```bash
ngrok http 5002
```

## 🔍 Debug & Logging

### Backend Logs
- VNPay: `🏦 VNPay Request Params`, `🔐 VNPay signData`, `✅ VNPay signature`
- ZaloPay: `🟡 ZaloPay Request`, `✅ ZaloPay Response`
- Payment Result: `🔍 VNPay Return - Response Code`, `🔍 ZaloPay callback - MAC`

### Frontend Logs
- Checkout: `📦 Creating order with data`, `💳 Creating VNPay payment`
- Payment Result: `🔍 Payment Result Params`, `💳 VNPay check response`

## 🚨 Troubleshooting

### VNPay Error Code 72: "Không tìm thấy website"
- **Nguyên nhân**: Domain chưa được đăng ký với VNPay sandbox
- **Giải pháp**: Đăng ký domain trên https://sandbox.vnpayment.vn/devreg

### VNPay Error Code 70: "Sai chữ ký"
- **Nguyên nhân**: Hash secret không đúng hoặc tham số bị thay đổi
- **Giải pháp**: Kiểm tra VNP_HASHSECRET và tham số gửi lên

### ZaloPay Error
- **Nguyên nhân**: App ID, Key không đúng hoặc callback URL không public
- **Giải pháp**: Kiểm tra cấu hình ZaloPay và ngrok URL

## 📝 Notes

1. **Sandbox Mode**: Hiện tại đang dùng sandbox cho cả VNPay và ZaloPay
2. **Production**: Cần thay đổi URL và credentials khi deploy production
3. **Security**: Luôn validate chữ ký từ payment gateway
4. **Error Handling**: Luôn có fallback cho trường hợp thanh toán thất bại
5. **Database**: Cần cập nhật trạng thái đơn hàng sau khi thanh toán thành công

## 🔗 References

- [VNPay Documentation](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop)
- [ZaloPay Documentation](https://docs.zalopay.vn/)
- [Payment_onl Demo](payment_onl/) - Code mẫu tham khảo 