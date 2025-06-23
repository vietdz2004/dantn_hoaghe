# Admin API Structure Documentation

## 📁 Cấu trúc Folder Admin API

```
backend/
├── routes/admin/
│   ├── index.js                    # Main admin router
│   ├── dashboardRoutes.js          # Dashboard statistics & overview
│   ├── productRoutes.js            # Product management
│   ├── orderRoutes.js              # Order management
│   ├── userRoutes.js               # User/Customer management
│   ├── categoryRoutes.js           # Category management
│   └── quickOrderRoutes.js         # Quick order management
│
├── controllers/admin/
│   ├── adminDashboardController.js # Dashboard logic
│   ├── adminProductController.js   # Product CRUD & management
│   ├── adminOrderController.js     # Order processing & analytics
│   ├── adminUserController.js      # User management
│   ├── adminCategoryController.js  # Category & subcategory management
│   └── adminQuickOrderController.js # Quick order processing
│
└── app.js                          # Main app with admin routes
```

## 🔌 API Endpoints

### Base URL: `/api/admin`

## 📊 Dashboard APIs (`/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Thống kê tổng quan hệ thống |
| GET | `/recent-activities` | Hoạt động gần đây |
| GET | `/sales-stats?period=30d` | Thống kê bán hàng |
| GET | `/product-stats` | Thống kê sản phẩm |
| GET | `/order-stats?period=30d` | Thống kê đơn hàng |
| GET | `/user-stats` | Thống kê người dùng |
| GET | `/top-products?limit=10` | Top sản phẩm bán chạy |
| GET | `/revenue-analytics?period=30d` | Phân tích doanh thu |

## 🛍️ Product APIs (`/products`)

### Basic CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Lấy danh sách sản phẩm (có filter) |
| GET | `/:id` | Lấy chi tiết sản phẩm |
| POST | `/` | Tạo sản phẩm mới |
| PUT | `/:id` | Cập nhật sản phẩm |
| DELETE | `/:id` | Xóa sản phẩm |

### Status Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:id/status` | Toggle trạng thái sản phẩm |
| POST | `/bulk/update-status` | Cập nhật trạng thái hàng loạt |

### Stock Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:id/stock` | Cập nhật kho sản phẩm |
| POST | `/bulk/update-stock` | Cập nhật kho hàng loạt |

### Special Filters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/low-stock?limit=50` | Sản phẩm sắp hết hàng |
| GET | `/out-of-stock?limit=50` | Sản phẩm hết hàng |
| GET | `/discounted?limit=50` | Sản phẩm giảm giá |
| GET | `/category/:id?page=1&limit=20` | Sản phẩm theo danh mục |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/performance?period=30d` | Hiệu suất sản phẩm |
| GET | `/inventory-analytics` | Phân tích kho |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Lấy danh mục & danh mục con |
| GET | `/categories/:id/subcategories` | Lấy danh mục con |

### Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bulk/delete` | Xóa sản phẩm hàng loạt |

### Import/Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/import` | Import từ Excel |
| GET | `/export?filters=...` | Export ra Excel |
| GET | `/template` | Tải template Excel |

## 📦 Order APIs (`/orders`)

### Basic CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Lấy danh sách đơn hàng (có filter) |
| GET | `/:id` | Lấy chi tiết đơn hàng |
| PUT | `/:id` | Cập nhật đơn hàng |
| DELETE | `/:id` | Xóa đơn hàng |

### Status Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:id/status` | Cập nhật trạng thái đơn hàng |
| POST | `/bulk/update-status` | Cập nhật trạng thái hàng loạt |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary?period=30d` | Tổng quan đơn hàng |
| GET | `/analytics/trends?period=30d` | Xu hướng đơn hàng |
| GET | `/analytics/revenue?period=30d` | Phân tích doanh thu |

### Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bulk/delete` | Xóa đơn hàng hàng loạt |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/excel?filters=...` | Export đơn hàng ra Excel |

## 👥 User APIs (`/users`)

### Basic CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Lấy danh sách khách hàng (có filter) |
| GET | `/:id` | Lấy chi tiết khách hàng |
| PUT | `/:id` | Cập nhật thông tin khách hàng |
| DELETE | `/:id` | Xóa khách hàng |

### Status Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:id/status` | Cập nhật trạng thái người dùng |
| POST | `/bulk/update-status` | Cập nhật trạng thái hàng loạt |

### User Details
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:id/orders?page=1&limit=10` | Lịch sử đơn hàng khách hàng |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary?period=30d` | Tổng quan người dùng |
| GET | `/analytics/activity?period=30d` | Hoạt động người dùng |

### Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bulk/delete` | Xóa khách hàng hàng loạt |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/excel?filters=...` | Export khách hàng ra Excel |

## 📂 Category APIs (`/categories`)

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Lấy tất cả danh mục |
| GET | `/:id` | Lấy chi tiết danh mục |
| POST | `/` | Tạo danh mục mới |
| PUT | `/:id` | Cập nhật danh mục |
| DELETE | `/:id` | Xóa danh mục |

### SubCategories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:categoryId/subcategories` | Lấy danh mục con |
| POST | `/:categoryId/subcategories` | Tạo danh mục con |
| PUT | `/subcategories/:id` | Cập nhật danh mục con |
| DELETE | `/subcategories/:id` | Xóa danh mục con |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | Thống kê danh mục |
| GET | `/:id/products?page=1&limit=20` | Sản phẩm trong danh mục |

### Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bulk/delete` | Xóa danh mục hàng loạt |
| POST | `/subcategories/bulk/delete` | Xóa danh mục con hàng loạt |

## ⚡ Quick Order APIs (`/quick-orders`)

### Basic CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Lấy danh sách đơn nhanh (có filter) |
| GET | `/:id` | Lấy chi tiết đơn nhanh |
| PUT | `/:id` | Cập nhật đơn nhanh |
| DELETE | `/:id` | Xóa đơn nhanh |

### Status Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:id/status` | Cập nhật trạng thái đơn nhanh |
| POST | `/bulk/update-status` | Cập nhật trạng thái hàng loạt |

### Convert Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:id/convert` | Chuyển đổi thành đơn hàng thường |
| POST | `/bulk/convert` | Chuyển đổi hàng loạt |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary?period=30d` | Tổng quan đơn nhanh |

### Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bulk/delete` | Xóa đơn nhanh hàng loạt |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/excel?filters=...` | Export đơn nhanh ra Excel |

## 🔍 Query Parameters

### Common Filters
- `page`: Số trang (default: 1)
- `limit`: Số item mỗi trang (default: 20)
- `search`: Tìm kiếm text
- `sortBy`: Sắp xếp theo field
- `sortOrder`: ASC hoặc DESC

### Product Filters
- `category`: ID danh mục
- `subCategory`: ID danh mục con
- `status`: active, hidden
- `stockStatus`: low, out, good
- `priceRange`: min-max

### Order Filters
- `status`: CHO_XAC_NHAN, DA_XAC_NHAN, DANG_GIAO, DA_GIAO, DA_HUY
- `paymentMethod`: TIEN_MAT, CHUYEN_KHOAN, THE
- `dateFrom`: Từ ngày
- `dateTo`: Đến ngày
- `minTotal`: Tổng tiền tối thiểu
- `maxTotal`: Tổng tiền tối đa

### User Filters
- `status`: active, inactive, banned
- `dateFrom`: Từ ngày đăng ký
- `dateTo`: Đến ngày đăng ký

### Time Periods
- `7d`: 7 ngày qua
- `30d`: 30 ngày qua (default)
- `90d`: 3 tháng qua
- `12m`: 12 tháng qua

## 📱 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (in development)"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "filters": { ... }
}
```

## 🚀 Usage với Admin Frontend

Tất cả các API này đã được tích hợp sẵn trong:
- `admin-frontend-v2/src/services/api.js`
- `admin-frontend-v2/src/services/productService.js`
- `admin-frontend-v2/src/services/orderService.js`
- `admin-frontend-v2/src/services/userService.js`
- `admin-frontend-v2/src/services/dashboardService.js`

## 📝 Notes

1. Tất cả API đều có error handling và validation
2. Cache được implement ở frontend services
3. Bulk operations được thiết kế cho performance tốt
4. Analytics APIs provide real-time insights
5. Export functions sẽ được implement đầy đủ trong phase 2

## 🔒 Security (TODO)

- [ ] Authentication middleware
- [ ] Authorization based on admin roles
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] SQL injection protection 