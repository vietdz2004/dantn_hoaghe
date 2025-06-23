import api from './api';

// API base URL for quick orders
const QUICK_ORDER_ENDPOINT = '/quick-orders';

// Tạo đơn đặt nhanh
export const createQuickOrder = async (orderData) => {
  try {
    const response = await api.post(QUICK_ORDER_ENDPOINT, orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating quick order:', error);
    throw error.response?.data || { message: 'Có lỗi xảy ra khi tạo đơn hàng' };
  }
};

// Lấy danh sách đơn đặt nhanh (cho admin)
export const getQuickOrders = async (params = {}) => {
  try {
    const response = await api.get(QUICK_ORDER_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching quick orders:', error);
    throw error.response?.data || { message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng' };
  }
};

// Cập nhật trạng thái đơn đặt nhanh (cho admin)
export const updateQuickOrderStatus = async (orderId, updateData) => {
  try {
    const response = await api.patch(`${QUICK_ORDER_ENDPOINT}/${orderId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating quick order:', error);
    throw error.response?.data || { message: 'Có lỗi xảy ra khi cập nhật đơn hàng' };
  }
};

// Lấy thống kê đơn đặt nhanh (cho admin)
export const getQuickOrderStats = async () => {
  try {
    const response = await api.get(`${QUICK_ORDER_ENDPOINT}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quick order stats:', error);
    throw error.response?.data || { message: 'Có lỗi xảy ra khi lấy thống kê' };
  }
};

// Helper: Format order status text
export const formatOrderStatus = (status) => {
  const statusMap = {
    'CHO_XU_LY': 'Chờ xử lý',
    'DA_LIEN_HE': 'Đã liên hệ',
    'DA_XAC_NHAN': 'Đã xác nhận',
    'DANG_GIAO': 'Đang giao',
    'HOAN_THANH': 'Hoàn thành',
    'HUY': 'Đã hủy'
  };
  return statusMap[status] || status;
};

// Helper: Get status color
export const getStatusColor = (status) => {
  const colorMap = {
    'CHO_XU_LY': '#ff9800',    // Orange
    'DA_LIEN_HE': '#2196f3',   // Blue
    'DA_XAC_NHAN': '#009688',  // Teal
    'DANG_GIAO': '#9c27b0',    // Purple
    'HOAN_THANH': '#4caf50',   // Green
    'HUY': '#f44336'           // Red
  };
  return colorMap[status] || '#757575';
}; 