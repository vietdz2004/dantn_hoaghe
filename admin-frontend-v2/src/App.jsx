import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductPage from "./components/Product/AdminProductPage";
import AdminOrderList from "./pages/AdminOrderList";
import AdminVoucherList from "./pages/AdminVoucherList";
import AdminUserList from "./pages/AdminUserList";
import AdminReportPage from "./pages/AdminReportPage";
import AdminCategoryPage from "./pages/AdminCategoryPage";

function RequireAdminAuth() {
  const token = localStorage.getItem("admin_token");
  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdminAuth />}> {/* Bảo vệ các route admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductPage />} />
            <Route path="categories" element={<AdminCategoryPage />} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="vouchers" element={<AdminVoucherList />} />
            <Route path="users" element={<AdminUserList />} />
            <Route path="reports" element={<AdminReportPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
