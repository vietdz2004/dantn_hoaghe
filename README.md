<<<<<<< HEAD
# 🌸 Hoashop - Website Bán Hoa Tươi Online

## 📋 Tổng Quan Dự Án

Hoashop là một ứng dụng web bán hoa tươi online với kiến trúc **Full-Stack** sử dụng **React** cho frontend và **Node.js/Express** cho backend, kết nối với **MySQL** database thông qua **Sequelize ORM**.

## 🏗️ Kiến Trúc Hệ Thống

### **Frontend (Giao diện người dùng)**
- **React 18**: Thư viện JavaScript để xây dựng giao diện người dùng
- **Vite**: Build tool hiện đại, nhanh hơn Webpack
- **Material UI**: Thư viện component UI có sẵn
- **React Router**: Quản lý điều hướng trong ứng dụng
- **Axios**: Thư viện gọi HTTP requests

### **Backend (Máy chủ)**
- **Node.js**: Runtime environment cho JavaScript
- **Express**: Framework web cho Node.js
- **Sequelize**: ORM (Object-Relational Mapping) để tương tác với database
- **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ

### **Database (Cơ sở dữ liệu)**
- **MySQL**: Database chính với 8 bảng
- **Tables**: Categories, Subcategories, Products, Orders, Users, Vouchers, Reviews, OrderItems

## 🚀 Hướng Dẫn Cài Đặt

### **Yêu Cầu Hệ Thống**
- **Node.js**: Phiên bản 16.0 trở lên
- **MySQL**: Phiên bản 8.0 trở lên
- **Git**: Để quản lý version control

### **Bước 1: Clone Repository**
```bash
git clone <repository-url>
cd love-hoa
```

### **Bước 2: Cài Đặt Backend**
```bash
cd backend
npm install
```

### **Bước 3: Cấu Hình Database**
1. Tạo file `.env` trong thư mục `backend/`
2. Cấu hình thông tin database:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hoashop
DB_PORT=3306
```

### **Bước 4: Khởi Tạo Database**
```bash
# Tạo database
mysql -u root -p
CREATE DATABASE hoashop;
USE hoashop;

# Import schema (nếu có file SQL)
source path/to/schema.sql;
```

### **Bước 5: Cài Đặt Frontend**
```bash
cd ../frontend
npm install
```

### **Bước 6: Chạy Ứng Dụng**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📁 Cấu Trúc Dự Án

```
love-hoa/
├── backend/                 # Máy chủ backend
│   ├── config/             # Cấu hình database
│   ├── controllers/        # Logic xử lý business
│   ├── models/            # Định nghĩa database models
│   ├── routes/            # Định nghĩa API endpoints
│   ├── middleware/        # Middleware functions
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point của server
├── frontend/              # Giao diện người dùng
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS modules
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Root component
│   └── package.json
├── docs/                  # Tài liệu dự án
│   ├── BACKEND_REPORT.md
│   ├── FRONTEND_REPORT.md
│   ├── DEVELOPMENT_GUIDE.md
│   └── FEATURE_SUGGESTIONS.md
└── README.md
```

## 🔧 API Endpoints

### **Categories (Danh mục)**
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục mới
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### **Subcategories (Danh mục con)**
- `GET /api/subcategories` - Lấy danh sách danh mục con
- `POST /api/subcategories` - Tạo danh mục con mới
- `PUT /api/subcategories/:id` - Cập nhật danh mục con
- `DELETE /api/subcategories/:id` - Xóa danh mục con

### **Products (Sản phẩm)**
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### **Orders (Đơn hàng)**
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id` - Cập nhật đơn hàng
- `DELETE /api/orders/:id` - Xóa đơn hàng

### **Users (Người dùng)**
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/:id` - Lấy chi tiết người dùng
- `POST /api/users` - Tạo người dùng mới
- `PUT /api/users/:id` - Cập nhật người dùng
- `DELETE /api/users/:id` - Xóa người dùng

### **Vouchers (Mã giảm giá)**
- `GET /api/vouchers` - Lấy danh sách voucher
- `POST /api/vouchers` - Tạo voucher mới
- `PUT /api/vouchers/:id` - Cập nhật voucher
- `DELETE /api/vouchers/:id` - Xóa voucher

### **Reviews (Đánh giá)**
- `GET /api/reviews` - Lấy danh sách đánh giá
- `POST /api/reviews` - Tạo đánh giá mới
- `PUT /api/reviews/:id` - Cập nhật đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá

## 🎯 Tính Năng Đã Hoàn Thành

### **Backend**
- ✅ Setup project với Express và Sequelize
- ✅ Cấu hình database MySQL
- ✅ Tạo models cho tất cả entities
- ✅ Implement CRUD operations cho tất cả models
- ✅ API endpoints với error handling
- ✅ Database relationships

### **Frontend**
- ✅ Setup project với Vite và React
- ✅ Cài đặt Material UI
- ✅ Tạo layout cơ bản với header và navigation
- ✅ Implement routing system
- ✅ Tạo component ProductCard
- ✅ Tạo trang ProductList với data fetching
- ✅ Tạo trang ProductDetail với dynamic routing
- ✅ Tạo trang Homepage với categories và products
- ✅ Implement CategoryMenu với dropdown
- ✅ Styling với CSS Modules

## 🚧 Tính Năng Đang Phát Triển

- 🔄 Responsive design optimization
- 🔄 Loading states và error handling
- 🔄 User authentication UI
- 🔄 Shopping cart functionality

## 📋 Kế Hoạch Tương Lai

- 📅 Admin dashboard
- 📅 User profile management
- 📅 Order tracking system
- 📅 Product search và filter
- 📅 Wishlist functionality
- 📅 Product reviews system
- 📅 Payment integration
- 📅 Email notifications

## 🤝 Git Workflow

### **Branch Strategy (Chiến lược nhánh)**
- `main` - Nhánh chính, chứa code production
- `develop` - Nhánh phát triển, tích hợp các tính năng
- `feature/feature-name` - Nhánh tính năng mới
- `bugfix/bug-description` - Nhánh sửa lỗi
- `hotfix/urgent-fix` - Nhánh sửa lỗi khẩn cấp

### **Commit Message Convention (Quy ước commit)**
```
feat: add new feature
fix: bug fix
docs: update documentation
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### **Workflow Steps (Các bước workflow)**
1. **Tạo branch mới** từ `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
```

2. **Phát triển tính năng** và commit thường xuyên
```bash
git add .
git commit -m "feat: add shopping cart functionality"
```

3. **Push branch** lên remote
```bash
git push origin feature/new-feature
```

4. **Tạo Pull Request** trên GitHub/GitLab
5. **Code Review** bởi team members
6. **Merge** vào `develop` sau khi approved
7. **Deploy** từ `develop` để testing
8. **Merge** `develop` vào `main` cho production

### **Git Commands Cơ Bản**
```bash
# Kiểm tra trạng thái
git status

# Xem lịch sử commit
git log --oneline

# Xem các branch
git branch -a

# Chuyển branch
git checkout branch-name

# Tạo branch mới
git checkout -b new-branch-name

# Merge branch
git merge branch-name

# Rebase branch
git rebase develop

# Stash changes
git stash
git stash pop
```

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
npm test
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

### **E2E Testing**
```bash
npm run test:e2e
```

## 📊 Monitoring & Analytics

- **Performance Monitoring**: Theo dõi hiệu suất ứng dụng
- **Error Tracking**: Giám sát lỗi với Sentry
- **User Analytics**: Phân tích hành vi người dùng với Google Analytics
- **API Monitoring**: Giám sát API endpoints

## 🔒 Security

- **HTTPS**: Bắt buộc sử dụng HTTPS
- **Input Validation**: Xác thực dữ liệu đầu vào
- **SQL Injection Prevention**: Ngăn chặn SQL injection
- **XSS Prevention**: Ngăn chặn Cross-Site Scripting
- **CORS Configuration**: Cấu hình Cross-Origin Resource Sharing

## 🚀 Deployment

### **Development Environment**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### **Production Environment**
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

### **Docker Deployment**
```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d
```

## 📚 Tài Liệu Tham Khảo

- [React Documentation](https://reactjs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Material UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Đóng Góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📞 Liên Hệ

- **Email**: contact@hoashop.com
- **Website**: https://hoashop.com
- **GitHub**: https://github.com/hoashop

## 📄 License

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

**Ngày cập nhật:** $(date)  
**Phiên bản:** 1.0.0  
**Trạng thái:** Đang phát triển 
=======
# phamvt
viet
>>>>>>> ba2aa91edc6d6aeca7a92adc2a10d2e68da53bec
