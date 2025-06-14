import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ProductPage from '../pages/ProductPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CategoryPage from '../pages/CategoryPage';
import OrderPage from '../pages/OrderPage';
import UserPage from '../pages/UserPage';

// AppRoutes: Định nghĩa các route chính của ứng dụng
const AppRoutes = () => (
  <Routes>
    {/* Trang chủ */}
    <Route path="/" element={<HomePage />} />
    {/* Trang sản phẩm */}
    <Route path="/products" element={<ProductPage />} />
    {/* Trang chi tiết sản phẩm */}
    <Route path="/products/:id" element={<ProductDetailPage />} />
    {/* Trang danh mục */}
    <Route path="/categories" element={<CategoryPage />} />
    {/* Trang đơn hàng */}
    <Route path="/orders" element={<OrderPage />} />
    {/* Trang người dùng */}
    <Route path="/users" element={<UserPage />} />
  </Routes>
);

export default AppRoutes; 