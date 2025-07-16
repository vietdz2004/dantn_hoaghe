import React, { useEffect, useState } from "react";
import axios from "../services/api";
import "./AdminDashboard.css";

function formatNumber(num) {
  return num?.toLocaleString("vi-VN") || 0;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0);
}

// Trang dashboard tổng quan cho admin với dữ liệu thực
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load dashboard data từ backend API thực
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [overviewRes, lowStockRes, topProductsRes, categoryRes] = await Promise.all([
          axios.get("/admin/dashboard/overview"),
          axios.get("/admin/dashboard/low-stock"),
          axios.get("/admin/dashboard/top-products"),
          axios.get("/admin/categories/analytics/summary")
        ]);

        if (overviewRes.data.success) {
          setStats(overviewRes.data.data);
        }

        if (lowStockRes.data.success) {
          setLowStockProducts(lowStockRes.data.data || []);
        }

        if (topProductsRes.data.success) {
          setTopProducts(topProductsRes.data.data || []);
        }

        if (categoryRes.data.success) {
          setCategoryStats(categoryRes.data.data);
        }

      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.response?.data?.message || "Lỗi tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Đang tải dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-state">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const currentTime = new Date().toLocaleString('vi-VN');

  // Tính toán phần trăm thay đổi dựa trên dữ liệu thực
  const getGrowthPercentage = (current, total) => {
    if (!total) return 0;
    return Math.round((current / total) * 100);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Tổng quan hệ thống</h1>
          <p className="page-subtitle">
            Cập nhật lần cuối: {currentTime}
          </p>
        </div>
      </div>

      {/* Stats Cards với dữ liệu thực */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Sản phẩm</h3>
            <span className="stat-trend positive">
              {stats.products?.active ? Math.round((stats.products.active / stats.products.total) * 100) : 0}% hoạt động
            </span>
          </div>
          <div className="stat-number">{formatNumber(stats.products?.total || 0)}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span>Hiển thị: {formatNumber(stats.products?.active || 0)}</span>
            </div>
            <div className="stat-item warning">
              <span>Tồn kho thấp: {formatNumber(stats.products?.lowStock || 0)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Đơn hàng</h3>
            <span className="stat-trend positive">
              +{formatNumber(stats.orders?.today || 0)} hôm nay
            </span>
          </div>
          <div className="stat-number">{formatNumber(stats.orders?.total || 0)}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span>Hôm nay: {formatNumber(stats.orders?.today || 0)}</span>
            </div>
            <div className="stat-item warning">
              <span>Chờ xử lý: {formatNumber(stats.orders?.pending || 0)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Người dùng</h3>
            <span className="stat-trend positive">
              +{formatNumber(stats.users?.newToday || 0)} mới
            </span>
          </div>
          <div className="stat-number">{formatNumber(stats.users?.total || 0)}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span>Mới hôm nay: {formatNumber(stats.users?.newToday || 0)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Doanh thu</h3>
            <span className="stat-trend positive">
              {stats.revenue?.today ? formatCurrency(stats.revenue.today) : '0'} hôm nay
            </span>
          </div>
          <div className="stat-number">{formatCurrency(stats.revenue?.total || 0)}</div>
          <div className="stat-details">
            <div className="stat-item">
              <span>Hôm nay: {formatCurrency(stats.revenue?.today || 0)}</span>
            </div>
            <div className="stat-item">
              <span>Tháng này: {formatCurrency(stats.revenue?.month || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Widgets với dữ liệu thực */}
      <div className="widgets-grid">
        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="widget">
            <div className="widget-header">
              <h3>Cảnh báo tồn kho thấp</h3>
              <span className="widget-count">{lowStockProducts.length} sản phẩm</span>
            </div>
            <div className="widget-content">
              <div className="item-list">
                {lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="list-item warning">
                    <span className="item-name">{product.name}</span>
                    <span className="item-value">
                      Còn {product.currentStock} / Tối thiểu {product.minStock}
                    </span>
                  </div>
                ))}
              </div>
              {lowStockProducts.length > 5 && (
                <button className="btn btn-outline">
                  Xem tất cả ({lowStockProducts.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="widget">
            <div className="widget-header">
              <h3>Sản phẩm bán chạy</h3>
            </div>
            <div className="widget-content">
              <div className="item-list">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="list-item">
                    <span className="item-rank">#{index + 1}</span>
                    <div className="item-info">
                      <span className="item-name">{product.name}</span>
                      <span className="item-meta">
                        {formatNumber(product.totalSold || 0)} đã bán
                      </span>
                    </div>
                    <span className="item-value">
                      {formatCurrency(product.totalRevenue || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Statistics */}
        {categoryStats && (
          <div className="widget">
            <div className="widget-header">
              <h3>Thống kê danh mục</h3>
            </div>
            <div className="widget-content">
              <div className="quick-stats">
                <div className="quick-stat">
                  <div className="quick-stat-number">
                    {formatNumber(categoryStats.totalCategories || 0)}
                  </div>
                  <div className="quick-stat-label">Danh mục cha</div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-number">
                    {formatNumber(categoryStats.totalSubCategories || 0)}
                  </div>
                  <div className="quick-stat-label">Danh mục con</div>
                </div>
              </div>
              <div className="stat-details" style={{ marginTop: '16px' }}>
                <div className="stat-item">
                  <span>Tổng sản phẩm: {formatNumber(categoryStats.totalProducts || 0)}</span>
                </div>
                <div className="stat-item">
                  <span>Đang hoạt động: {formatNumber(categoryStats.activeProducts || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 