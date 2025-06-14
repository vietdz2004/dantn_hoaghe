# Báo cáo tổng quát dự án Hoashop

## 1. Mục tiêu dự án
Hoashop là một ứng dụng web bán hàng hoa tươi, xây dựng theo mô hình full stack (React + Node.js/Express + MySQL). Dự án hướng tới việc quản lý các nghiệp vụ cơ bản của một shop online: sản phẩm, danh mục, đơn hàng, người dùng, đánh giá, voucher...

## 2. Kiến trúc tổng thể
- **Frontend:** React (Vite), Material UI, React Router, Axios
- **Backend:** Node.js, Express, Sequelize ORM, RESTful API
- **Database:** MySQL (thiết kế chuẩn hóa, có ràng buộc khoá ngoại)

## 3. Chức năng chính
- Quản lý người dùng (CRUD, phân quyền)
- Quản lý sản phẩm, danh mục, danh mục chi tiết (CRUD)
- Quản lý đơn hàng, chi tiết đơn hàng
- Quản lý voucher giảm giá
- Quản lý đánh giá sản phẩm
- API RESTful chuẩn, dễ tích hợp frontend/mobile

## 4. Điểm nổi bật kỹ thuật
- Phân lớp rõ ràng: Models, Controllers, Routes
- Sử dụng Sequelize ORM mapping chuẩn với database thực tế
- Xử lý quan hệ nhiều-nhiều, một-nhiều, một-một đúng chuẩn
- Xử lý lỗi và trả về thông báo rõ ràng cho client
- Dễ dàng mở rộng thêm tính năng mới

## 5. Hướng phát triển
- Thêm chức năng xác thực JWT, phân quyền nâng cao
- Tích hợp thanh toán online, gửi email
- Tối ưu performance, bảo mật API

---

# Quy trình hoạt động & Logic xử lý các module

## 1. Người dùng (User)
- **Đăng ký:** Người dùng gửi thông tin đăng ký, backend kiểm tra email/username trùng, mã hóa mật khẩu, lưu vào DB.
- **Đăng nhập:** Kiểm tra thông tin đăng nhập, trả về token (nếu có xác thực).
- **Quản lý:** Admin có thể tạo, sửa, xóa, xem danh sách người dùng.

## 2. Danh mục & Danh mục chi tiết (Category, SubCategory)
- **Tạo/sửa/xóa:** Admin thêm mới, cập nhật, xóa danh mục chính và danh mục chi tiết. Khi xóa danh mục chính sẽ xóa cascade các danh mục chi tiết liên quan.
- **Lấy danh sách:** API trả về danh sách danh mục, có thể kèm danh mục chi tiết con.

## 3. Sản phẩm (Product)
- **Tạo mới:** Admin nhập thông tin sản phẩm, chọn danh mục chi tiết, lưu vào DB.
- **Cập nhật/xóa:** Admin chỉnh sửa hoặc xóa sản phẩm. Khi xóa sản phẩm sẽ xóa các chi tiết đơn hàng liên quan.
- **Lấy danh sách:** Người dùng/khách có thể xem danh sách sản phẩm, lọc theo danh mục, tìm kiếm.

## 4. Đơn hàng & Chi tiết đơn hàng (Order, OrderDetail)
- **Tạo đơn hàng:** Người dùng chọn sản phẩm, nhập thông tin giao hàng, chọn voucher (nếu có), hệ thống tính tổng tiền, lưu đơn hàng và chi tiết đơn hàng vào DB.
- **Cập nhật trạng thái:** Admin cập nhật trạng thái đơn hàng (đang xử lý, đã giao, đã hủy...)
- **Lấy lịch sử:** Người dùng xem lịch sử đơn hàng của mình, admin xem tất cả đơn hàng.

## 5. Voucher
- **Tạo/sửa/xóa:** Admin tạo mã giảm giá, cấu hình điều kiện áp dụng, thời gian hiệu lực.
- **Kiểm tra hợp lệ:** Khi người dùng nhập mã, backend kiểm tra điều kiện, thời gian, số lượng, trả về kết quả hợp lệ hoặc không.

## 6. Đánh giá sản phẩm (Review)
- **Tạo đánh giá:** Sau khi đơn hàng hoàn thành, người dùng có thể đánh giá sản phẩm đã mua (liên kết qua chi tiết đơn hàng).
- **Lấy đánh giá:** API trả về danh sách đánh giá theo sản phẩm, hiển thị trên trang chi tiết sản phẩm.
- **Quản lý:** Admin có thể xóa các đánh giá không phù hợp.

## 7. Quy trình tổng thể đặt hàng
1. Người dùng đăng ký/đăng nhập
2. Duyệt sản phẩm, thêm vào giỏ hàng
3. Chọn địa chỉ, phương thức thanh toán, nhập mã giảm giá (nếu có)
4. Xác nhận đặt hàng, hệ thống lưu đơn hàng và chi tiết đơn hàng
5. Admin xử lý đơn, cập nhật trạng thái
6. Sau khi nhận hàng, người dùng có thể đánh giá sản phẩm

---

# Hoashop Backend API

Backend API cho ứng dụng Hoashop sử dụng Node.js, Express và MySQL.

## Cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Cấu hình database:**
- Tạo file `.env` từ `config.env`
- Cập nhật thông tin kết nối MySQL:
  - DB_HOST: localhost
  - DB_USER: root
  - DB_PASSWORD: your_password_here
  - DB_NAME: hoanghe
  - DB_PORT: 3306

3. **Import database:**
- Sử dụng file `data/hoanghe.sql` để tạo database và bảng

## Chạy ứng dụng

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Users
- `GET /api/users` - Lấy tất cả người dùng
- `GET /api/users/:id` - Lấy người dùng theo ID
- `POST /api/users` - Tạo người dùng mới
- `PUT /api/users/:id` - Cập nhật người dùng
- `DELETE /api/users/:id` - Xóa người dùng

### Products
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/:id` - Lấy sản phẩm theo ID
- `GET /api/products/category/:categoryId` - Lấy sản phẩm theo danh mục
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Categories
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/:id` - Lấy danh mục theo ID
- `POST /api/categories` - Tạo danh mục mới
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### SubCategories
- `GET /api/subcategories` - Lấy tất cả danh mục chi tiết
- `GET /api/subcategories/:id` - Lấy danh mục chi tiết theo ID
- `GET /api/subcategories/category/:categoryId` - Lấy danh mục chi tiết theo danh mục cha
- `POST /api/subcategories` - Tạo danh mục chi tiết mới
- `PUT /api/subcategories/:id` - Cập nhật danh mục chi tiết
- `DELETE /api/subcategories/:id` - Xóa danh mục chi tiết

### Orders
- `GET /api/orders` - Lấy tất cả đơn hàng
- `GET /api/orders/:id` - Lấy đơn hàng theo ID
- `GET /api/orders/user/:userId` - Lấy đơn hàng theo người dùng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id` - Cập nhật đơn hàng
- `DELETE /api/orders/:id` - Xóa đơn hàng

### Vouchers
- `GET /api/vouchers` - Lấy tất cả voucher
- `GET /api/vouchers/:id` - Lấy voucher theo ID
- `POST /api/vouchers` - Tạo voucher mới
- `POST /api/vouchers/validate` - Kiểm tra voucher có hợp lệ
- `PUT /api/vouchers/:id` - Cập nhật voucher
- `DELETE /api/vouchers/:id` - Xóa voucher

### Reviews
- `GET /api/reviews` - Lấy tất cả đánh giá
- `GET /api/reviews/:id` - Lấy đánh giá theo ID
- `GET /api/reviews/product/:productId` - Lấy đánh giá theo sản phẩm
- `POST /api/reviews` - Tạo đánh giá mới
- `PUT /api/reviews/:id` - Cập nhật đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá

## Cấu trúc Database

Database sử dụng MySQL với các bảng chính:
- `nguoidung` - Thông tin người dùng
- `danhmuc` - Danh mục chính
- `danhmucchitiet` - Danh mục chi tiết
- `sanpham` - Sản phẩm
- `donhang` - Đơn hàng
- `chitietdonhang` - Chi tiết đơn hàng
- `voucher` - Voucher giảm giá
- `danhgia` - Đánh giá sản phẩm

## Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM cho MySQL
- **MySQL2** - Driver MySQL
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Quản lý biến môi trường 