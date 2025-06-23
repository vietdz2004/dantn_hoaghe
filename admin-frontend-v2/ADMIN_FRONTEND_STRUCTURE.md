# Admin Frontend Structure Documentation

## 📁 Cấu trúc Folder Admin Frontend

```
admin-frontend-v2/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Common components (Loading, Alert, etc.)
│   │   ├── forms/           # Form components
│   │   ├── tables/          # Data table components
│   │   └── charts/          # Chart components
│   │
│   ├── layouts/             # Layout components
│   │   └── AdminLayout.jsx  # Main admin layout with sidebar & header
│   │
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx    # Dashboard overview
│   │   ├── Products.jsx     # Product management
│   │   ├── Orders.jsx       # Order management (TODO)
│   │   ├── Users.jsx        # User management (TODO)
│   │   ├── Categories.jsx   # Category management (TODO)
│   │   └── QuickOrders.jsx  # Quick order management (TODO)
│   │
│   ├── services/            # API & Business logic services
│   │   ├── api.js           # Core API wrapper & utilities
│   │   ├── productService.js # Product management service
│   │   ├── orderService.js   # Order management service
│   │   ├── userService.js    # User management service
│   │   └── dashboardService.js # Dashboard data service
│   │
│   ├── hooks/               # Custom React hooks (TODO)
│   │   ├── useApi.js        # API calling hook
│   │   ├── useDebounce.js   # Debounce hook
│   │   └── usePagination.js # Pagination hook
│   │
│   ├── utils/               # Utility functions (TODO)
│   │   ├── formatters.js    # Data formatting
│   │   ├── validators.js    # Form validation
│   │   └── constants.js     # App constants
│   │
│   ├── App.jsx              # Main app component with routing
│   └── main.jsx             # App entry point
│
├── public/                  # Static assets
├── package.json             # Dependencies & scripts
└── vite.config.js          # Vite configuration
```

## 🎨 Tech Stack

- **Framework**: React 18 với Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Fetch API với wrapper
- **Styling**: Material-UI sx props + theme
- **Icons**: Material-UI Icons

## 🔌 Services Architecture

### API Service (`src/services/api.js`)

**Centralized API wrapper** cho tất cả HTTP requests:

```javascript
// Core API methods
api.get(url, config)
api.post(url, data, config)
api.put(url, data, config)
api.delete(url, config)

// Specialized API groups
dashboardAPI.*
productAPI.*
orderAPI.*
userAPI.*
categoryAPI.*
quickOrderAPI.*
```

### Business Logic Services

**1. Product Service** (`productService.js`)
- Product CRUD với validation
- Stock management
- Category integration
- Search & filtering
- Import/Export
- Cache management

**2. Order Service** (`orderService.js`)
- Order management
- Status updates
- Analytics
- Bulk operations
- Export functionality

**3. User Service** (`userService.js`)
- User/Customer management
- Status management
- Activity tracking
- Analytics

**4. Dashboard Service** (`dashboardService.js`)
- Dashboard data aggregation
- Real-time updates
- Chart data formatting
- KPI calculations
- Alert management

## 📊 Dashboard Overview

### Current Features
- **Stats Cards**: Tổng sản phẩm, đơn hàng, doanh thu, khách hàng
- **Recent Orders Table**: 10 đơn hàng gần nhất
- **Quick Actions**: Shortcuts đến các trang quan trọng
- **Chart Placeholders**: Sẵn sàng cho Chart.js integration

### Planned Features
- Real-time charts (doanh thu, đơn hàng)
- Alert notifications
- Performance metrics
- Quick statistics widgets

## 🛍️ Product Management

### Current Features
- **Product Listing**: Table với pagination
- **Search & Filter**: Tìm kiếm, lọc theo danh mục, trạng thái
- **Action Buttons**: View, Edit, Delete, Toggle Status
- **Bulk Operations**: Select multiple products

### Planned Features
- Create/Edit product forms
- Image upload
- Stock management
- Category assignment
- Import/Export Excel
- Product performance analytics

## 🎯 Planned Pages & Features

### 📦 Orders Management
- Order listing với advanced filters
- Order detail view với customer info
- Status update workflow
- Bulk operations
- Revenue analytics
- Export functionality

### 👥 Users Management  
- Customer listing
- User profile management
- Order history per user
- User activity tracking
- User segments & analytics

### 📂 Categories Management
- Category & subcategory CRUD
- Drag & drop reordering
- Product count per category
- Category performance analytics

### ⚡ Quick Orders
- Quick order processing
- Convert to regular orders
- Status management
- Analytics dashboard

## 🎨 UI/UX Design

### Theme Configuration
```javascript
const theme = {
  palette: {
    primary: { main: '#2563eb' },    // Professional blue
    secondary: { main: '#10b981' },  // Success green
    background: {
      default: '#f8fafc',           // Light gray
      paper: '#ffffff'              // White
    }
  }
}
```

### Component Standards
- **Consistent Spacing**: Material-UI spacing units
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton placeholders
- **Error Handling**: User-friendly error messages
- **Accessibility**: ARIA labels và keyboard navigation

## 🔄 Data Flow

```
User Action → Page Component → Service → API → Backend
                     ↓
UI Update ← State Update ← Response ← Processing ← Database
```

### State Management Pattern
1. **Local State**: useState cho component-specific data
2. **Service Layer**: Business logic và caching
3. **API Layer**: HTTP communication
4. **Error Handling**: Centralized error management

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 600px (Drawer collapse, compact tables)
- **Tablet**: 600px - 960px (Responsive tables)  
- **Desktop**: > 960px (Full layout)

### Mobile Optimizations
- Collapsible sidebar
- Touch-friendly buttons
- Swipe gestures
- Optimized table layouts

## 🚀 Performance Optimizations

### Implemented
- **Service Caching**: 5-minute cache cho stable data
- **Lazy Loading**: React.lazy cho code splitting
- **Debounced Search**: Reduce API calls
- **Optimized Re-renders**: Proper dependency arrays

### Planned
- Virtual scrolling cho large tables
- Image lazy loading
- Service workers
- Progressive Web App features

## 🔍 Development Workflow

### Getting Started
```bash
cd admin-frontend-v2
npm install
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview build
```

### Code Organization
- **One feature per file**: Clear separation of concerns
- **Consistent naming**: camelCase cho functions, PascalCase cho components
- **Service abstraction**: Business logic separate from UI
- **Error boundaries**: Catch và handle React errors

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Advanced charts với Chart.js
- [ ] Real-time notifications với WebSocket
- [ ] Advanced search với Elasticsearch
- [ ] Bulk import/export với Excel
- [ ] Role-based permissions
- [ ] Advanced analytics dashboard

### Phase 3 Features
- [ ] PWA capabilities
- [ ] Offline support
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Theme customization
- [ ] Plugin architecture

## 🔒 Security Considerations

### Planned Security Features
- [ ] JWT authentication
- [ ] Role-based access control
- [ ] Input sanitization
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure file uploads

## 📝 Development Notes

### Current Status
✅ **Complete**
- Project setup với Vite + React + MUI
- Basic routing structure
- Admin layout với responsive sidebar
- Dashboard với mock data
- Product listing page
- API service layer
- Business logic services

🚧 **In Progress**
- Product management forms
- Order management pages
- User management interface

⏳ **Planned**
- Advanced analytics
- Real-time features
- Import/Export functionality
- Advanced search & filtering

### Known Issues
- [ ] Need authentication integration
- [ ] Error handling needs improvement
- [ ] Mobile UX optimization needed
- [ ] Performance testing required

### Development Guidelines
1. Follow Material-UI design patterns
2. Implement proper error handling
3. Add loading states for all async operations
4. Use TypeScript for better type safety (future)
5. Write unit tests for services (future)
6. Document all API integrations 