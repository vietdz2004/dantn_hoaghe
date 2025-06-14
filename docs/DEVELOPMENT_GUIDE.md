# Hướng Dẫn Phát Triển - Hoashop

## 🎯 Tổng Quan Dự Án

Hoashop là một ứng dụng web bán hoa tươi online với kiến trúc **Full-Stack** (Toàn bộ stack công nghệ từ frontend đến backend). Dự án sử dụng **MERN Stack** (MongoDB, Express, React, Node.js) nhưng thay thế MongoDB bằng MySQL để phù hợp với yêu cầu.

## 🏗️ Kiến Trúc Hệ Thống

### **Frontend (Giao diện người dùng)**
- **React**: Thư viện JavaScript để xây dựng giao diện người dùng
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
- **MySQL**: Database chính
- **8 Tables**: Categories, Subcategories, Products, Orders, Users, Vouchers, Reviews, OrderItems

## 🚀 Hướng Dẫn Cài Đặt

### **Yêu Cầu Hệ Thống**
- **Node.js**: Phiên bản 16.0 trở lên
- **MySQL**: Phiên bản 8.0 trở lên
- **Git**: Để quản lý version control
- **Code Editor**: VS Code được khuyến nghị

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

## 📁 Cấu Trúc Thư Mục

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
└── README.md
```

## 🔧 Công Cụ Phát Triển

### **Development Tools (Công cụ phát triển)**
- **VS Code**: Code editor chính
- **Postman**: Test API endpoints
- **MySQL Workbench**: Quản lý database
- **Git**: Version control
- **Chrome DevTools**: Debug frontend

### **Useful Extensions (Tiện ích mở rộng)**
- **ES7+ React/Redux/React-Native snippets**: Code snippets cho React
- **Prettier**: Format code tự động
- **ESLint**: Kiểm tra lỗi code
- **Auto Rename Tag**: Tự động đổi tên HTML tags
- **Bracket Pair Colorizer**: Màu sắc cho brackets

## 📚 Kiến Thức Cần Thiết

### **JavaScript Fundamentals (Kiến thức cơ bản JavaScript)**
- **ES6+ Features**: Arrow functions, destructuring, spread operator
- **Async/Await**: Xử lý bất đồng bộ
- **Promises**: Promise-based programming
- **Modules**: Import/export syntax

### **React Concepts (Khái niệm React)**
- **Components**: Functional và Class components
- **Props**: Truyền dữ liệu giữa components
- **State**: Quản lý trạng thái component
- **Hooks**: useState, useEffect, useCallback, useMemo
- **JSX**: JavaScript XML syntax

### **Backend Concepts (Khái niệm Backend)**
- **RESTful API**: Thiết kế API theo chuẩn REST
- **MVC Pattern**: Model-View-Controller architecture
- **Middleware**: Functions xử lý request/response
- **Authentication**: Xác thực người dùng
- **Authorization**: Phân quyền truy cập

### **Database Concepts (Khái niệm Database)**
- **SQL**: Structured Query Language
- **Relationships**: One-to-many, many-to-many
- **Indexing**: Tối ưu hóa truy vấn
- **Transactions**: Giao dịch database
- **ORM**: Object-Relational Mapping

## 🛠️ Quy Trình Phát Triển

### **Development Workflow (Quy trình phát triển)**
1. **Planning**: Lập kế hoạch tính năng
2. **Design**: Thiết kế UI/UX
3. **Backend Development**: Phát triển API
4. **Frontend Development**: Phát triển giao diện
5. **Integration**: Tích hợp frontend-backend
6. **Testing**: Kiểm thử
7. **Deployment**: Triển khai

### **Git Workflow (Quy trình Git)**
```bash
# Tạo branch mới
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create Pull Request
# Merge to main branch
```

### **Code Standards (Tiêu chuẩn code)**
- **Naming Convention**: camelCase cho variables, PascalCase cho components
- **File Structure**: Tổ chức file theo chức năng
- **Comments**: Comment code phức tạp
- **Error Handling**: Xử lý lỗi đầy đủ
- **Performance**: Tối ưu hóa hiệu suất

## 🔍 Debugging Techniques (Kỹ thuật debug)

### **Frontend Debugging**
- **Console.log**: In ra thông tin debug
- **React DevTools**: Extension debug React
- **Network Tab**: Kiểm tra API calls
- **Sources Tab**: Debug JavaScript code

### **Backend Debugging**
- **Console.log**: In ra server logs
- **Postman**: Test API endpoints
- **Database Logs**: Kiểm tra SQL queries
- **Error Handling**: Try-catch blocks

### **Common Issues (Vấn đề thường gặp)**
- **CORS Error**: Cross-Origin Resource Sharing
- **Database Connection**: Kết nối database
- **API Endpoints**: URL không đúng
- **State Management**: Cập nhật state không đúng

## 🧪 Testing Strategies (Chiến lược kiểm thử)

### **Manual Testing (Kiểm thử thủ công)**
- **Functional Testing**: Kiểm tra chức năng
- **UI Testing**: Kiểm tra giao diện
- **Cross-browser Testing**: Kiểm tra trên nhiều trình duyệt
- **Mobile Testing**: Kiểm tra trên mobile

### **Automated Testing (Kiểm thử tự động)**
- **Unit Tests**: Jest cho backend, React Testing Library cho frontend
- **Integration Tests**: Kiểm tra tương tác giữa components
- **E2E Tests**: Cypress cho end-to-end testing

### **Testing Tools (Công cụ kiểm thử)**
- **Jest**: Framework testing JavaScript
- **React Testing Library**: Test React components
- **Cypress**: E2E testing framework
- **Postman**: API testing

## 📱 Responsive Design (Thiết kế đáp ứng)

### **Mobile-First Approach (Phương pháp mobile-first)**
- Thiết kế cho mobile trước
- Sau đó mở rộng cho tablet và desktop
- Sử dụng CSS media queries

### **Breakpoints (Điểm ngắt)**
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### **Flexible Layouts (Bố cục linh hoạt)**
- **CSS Grid**: Layout system 2D
- **Flexbox**: Layout system 1D
- **Responsive Images**: Hình ảnh thích ứng
- **Touch-friendly**: Thân thiện với touch

## 🔒 Security Best Practices (Thực hành bảo mật tốt nhất)

### **Frontend Security**
- **Input Validation**: Xác thực dữ liệu đầu vào
- **XSS Prevention**: Ngăn chặn Cross-Site Scripting
- **HTTPS**: Sử dụng HTTPS cho tất cả requests
- **Environment Variables**: Không hardcode sensitive data

### **Backend Security**
- **Authentication**: JWT tokens
- **Authorization**: Role-based access control
- **Input Sanitization**: Làm sạch dữ liệu đầu vào
- **SQL Injection Prevention**: Sử dụng parameterized queries

### **Database Security**
- **Strong Passwords**: Mật khẩu mạnh
- **Limited Permissions**: Giới hạn quyền truy cập
- **Regular Backups**: Sao lưu định kỳ
- **Encryption**: Mã hóa dữ liệu nhạy cảm

## 🚀 Performance Optimization (Tối ưu hóa hiệu suất)

### **Frontend Optimization**
- **Code Splitting**: Chia nhỏ bundle
- **Lazy Loading**: Load component khi cần
- **Image Optimization**: Nén hình ảnh
- **Caching**: Cache static assets

### **Backend Optimization**
- **Database Indexing**: Tạo index cho queries
- **Connection Pooling**: Quản lý kết nối database
- **Caching**: Redis cache
- **Compression**: Nén response data

### **Database Optimization**
- **Query Optimization**: Tối ưu hóa SQL queries
- **Indexing Strategy**: Chiến lược tạo index
- **Normalization**: Chuẩn hóa database
- **Partitioning**: Phân vùng bảng lớn

## 📊 Monitoring & Analytics (Giám sát và phân tích)

### **Performance Monitoring**
- **Page Load Time**: Thời gian tải trang
- **API Response Time**: Thời gian phản hồi API
- **Database Query Time**: Thời gian truy vấn database
- **Error Rates**: Tỷ lệ lỗi

### **User Analytics**
- **Google Analytics**: Theo dõi hành vi người dùng
- **Heatmaps**: Bản đồ nhiệt tương tác
- **Conversion Tracking**: Theo dõi chuyển đổi
- **A/B Testing**: Thử nghiệm A/B

### **Error Monitoring**
- **Sentry**: Giám sát lỗi real-time
- **Log Management**: Quản lý logs
- **Alert System**: Hệ thống cảnh báo
- **Performance Metrics**: Chỉ số hiệu suất

## 🚀 Deployment (Triển khai)

### **Frontend Deployment**
- **Vercel**: Platform chuyên cho React apps
- **Netlify**: Hosting với CI/CD
- **AWS S3 + CloudFront**: Cloud hosting
- **GitHub Pages**: Free hosting

### **Backend Deployment**
- **Heroku**: Platform as a Service
- **AWS EC2**: Virtual server
- **DigitalOcean**: Cloud hosting
- **Railway**: Modern deployment platform

### **Database Deployment**
- **AWS RDS**: Managed MySQL service
- **PlanetScale**: Serverless MySQL
- **DigitalOcean Managed Database**: Managed MySQL
- **Self-hosted**: Tự host MySQL

### **CI/CD Pipeline**
- **GitHub Actions**: Automated workflows
- **Netlify Functions**: Serverless functions
- **Docker**: Containerization
- **Environment Management**: Quản lý môi trường

## 📚 Learning Resources (Tài liệu học tập)

### **React Learning**
- React Official Documentation
- React Tutorial (Tic-tac-toe game)
- React Hooks Guide
- React Router Documentation

### **Node.js Learning**
- Node.js Official Documentation
- Express.js Guide
- Sequelize Documentation
- MySQL Tutorial

### **General Web Development**
- MDN Web Docs
- JavaScript.info
- CSS-Tricks
- Stack Overflow

### **Tools & Best Practices**
- Git Handbook
- VS Code Documentation
- Postman Learning Center
- Chrome DevTools Guide

## 🎯 Project Roadmap (Lộ trình dự án)

### **Phase 1: Foundation (Nền tảng)**
- [x] Setup project structure
- [x] Basic CRUD operations
- [x] Simple UI components
- [x] Database schema

### **Phase 2: Core Features (Tính năng cốt lõi)**
- [ ] User authentication
- [ ] Shopping cart
- [ ] Product search
- [ ] Order management

### **Phase 3: Advanced Features (Tính năng nâng cao)**
- [ ] Payment integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics dashboard

### **Phase 4: Optimization (Tối ưu hóa)**
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Testing coverage
- [ ] Documentation

### **Phase 5: Deployment (Triển khai)**
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Maintenance plan

## 🤝 Contributing Guidelines (Hướng dẫn đóng góp)

### **Code Review Process**
1. **Self Review**: Tự kiểm tra code trước khi submit
2. **Peer Review**: Đồng nghiệp review code
3. **Testing**: Đảm bảo code hoạt động đúng
4. **Documentation**: Cập nhật documentation

### **Commit Message Convention**
```
feat: add new feature
fix: bug fix
docs: update documentation
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### **Branch Naming Convention**
```
feature/feature-name
bugfix/bug-description
hotfix/urgent-fix
release/version-number
```

## 📞 Support & Communication (Hỗ trợ và giao tiếp)

### **Communication Channels**
- **Slack**: Team communication
- **Discord**: Voice chat
- **Email**: Formal communication
- **GitHub Issues**: Bug tracking

### **Documentation**
- **README.md**: Project overview
- **API Documentation**: Backend API docs
- **Component Documentation**: Frontend component docs
- **Deployment Guide**: How to deploy

### **Code Standards**
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety (future)
- **Testing**: Unit and integration tests

---

**Ngày cập nhật:** $(date)  
**Phiên bản:** 1.0.0  
**Tác giả:** Development Team  
**Trạng thái:** Đang phát triển 