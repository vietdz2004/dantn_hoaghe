const { sequelize } = require('../../models/database');
const { QueryTypes } = require('sequelize');
const { Order, User, OrderDetail, Product } = require('../../models');

// Get all orders with advanced filtering
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      paymentMethod,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build WHERE conditions
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Search condition
    if (search) {
      whereConditions.push(`
        (o.id_DonHang LIKE $${paramIndex} OR 
         u.ten LIKE $${paramIndex + 1} OR 
         u.soDienThoai LIKE $${paramIndex + 2} OR 
         u.email LIKE $${paramIndex + 3})
      `);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      paramIndex += 4;
    }
    
    // Status filter
    if (status) {
      whereConditions.push(`o.trangThaiDonHang = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    // Payment method filter
    if (paymentMethod) {
      whereConditions.push(`o.phuongThucThanhToan = $${paramIndex}`);
      queryParams.push(paymentMethod);
      paramIndex++;
    }
    
    // Date range filter
    if (dateFrom && dateTo) {
      whereConditions.push(`o.ngayDatHang BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      queryParams.push(new Date(dateFrom), new Date(dateTo));
      paramIndex += 2;
    } else if (dateFrom) {
      whereConditions.push(`o.ngayDatHang >= $${paramIndex}`);
      queryParams.push(new Date(dateFrom));
      paramIndex++;
    } else if (dateTo) {
      whereConditions.push(`o.ngayDatHang <= $${paramIndex}`);
      queryParams.push(new Date(dateTo));
      paramIndex++;
    }
    
    // Total amount filter
    if (minTotal || maxTotal) {
      if (minTotal && maxTotal) {
        whereConditions.push(`o.tongThanhToan BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        queryParams.push(parseFloat(minTotal), parseFloat(maxTotal));
        paramIndex += 2;
      } else if (minTotal) {
        whereConditions.push(`o.tongThanhToan >= $${paramIndex}`);
        queryParams.push(parseFloat(minTotal));
        paramIndex++;
      } else if (maxTotal) {
        whereConditions.push(`o.tongThanhToan <= $${paramIndex}`);
        queryParams.push(parseFloat(maxTotal));
        paramIndex++;
      }
    }

    // Build ORDER BY clause
    let orderClause = '';
    switch (sortBy) {
      case 'total':
        orderClause = `ORDER BY o.tongThanhToan ${sortOrder.toUpperCase()}`;
        break;
      case 'status':
        orderClause = `ORDER BY o.trangThaiDonHang ${sortOrder.toUpperCase()}`;
        break;
      case 'createdAt':
      default:
        orderClause = `ORDER BY o.ngayDatHang ${sortOrder.toUpperCase()}`;
        break;
    }
    
    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Main query
    const mainQuery = `
      SELECT 
        o.*,
        u.ten as customerName,
        u.email as customerEmail,
        u.soDienThoai as customerPhone,
        u.diaChi as customerAddress,
        COUNT(od.id_ChiTietDH) as itemCount
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      LEFT JOIN chitietdonhang od ON o.id_DonHang = od.id_DonHang
      ${whereClause}
      GROUP BY o.id_DonHang, u.id_NguoiDung
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT o.id_DonHang) as total
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      ${whereClause}
    `;

    queryParams.push(parseInt(limit), offset);
    
    const [orders, countResult] = await Promise.all([
      sequelize.query(mainQuery, { 
        bind: queryParams, 
        type: QueryTypes.SELECT 
      }),
      sequelize.query(countQuery, { 
        bind: queryParams.slice(0, -2),
        type: QueryTypes.SELECT 
      })
    ]);

    const totalItems = parseInt(countResult[0].total);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        search,
        status,
        paymentMethod,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        o.*,
        u.ten as customerName,
        u.email as customerEmail,
        u.soDienThoai as customerPhone,
        u.diaChi as customerAddress
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      WHERE o.id_DonHang = $1
    `;
    
    const orderResult = await sequelize.query(query, {
      bind: [id],
      type: QueryTypes.SELECT
    });
    
    if (orderResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Get order details
    const detailsQuery = `
      SELECT 
        od.*,
        p.tenSp,
        p.hinhAnh,
        p.gia as originalPrice,
        p.maSKU
      FROM chitietdonhang od
      LEFT JOIN sanpham p ON od.id_SanPham = p.id_SanPham
      WHERE od.id_DonHang = $1
      ORDER BY od.id_ChiTietDH
    `;
    
    const orderDetails = await sequelize.query(detailsQuery, {
      bind: [id],
      type: QueryTypes.SELECT
    });

    const order = {
      ...orderResult[0],
      OrderDetails: orderDetails
    };
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết đơn hàng',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không được để trống'
      });
    }

    const validStatuses = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO', 'DA_HUY'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    await order.update({ 
      trangThaiDonHang: status,
      ...(note && { ghiChu: note })
    });

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng',
      error: error.message
    });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    await order.update(updateData);

    res.json({
      success: true,
      message: 'Cập nhật đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Error in updateOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật đơn hàng',
      error: error.message
    });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    await order.destroy();

    res.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đơn hàng',
      error: error.message
    });
  }
};

// Bulk update order status
exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID đơn hàng không hợp lệ'
      });
    }

    const validStatuses = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO', 'DA_HUY'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const query = `UPDATE donhang SET trangThaiDonHang = ? WHERE id_DonHang IN (${orderIds.map(() => '?').join(',')})`;
    await sequelize.query(query, {
      replacements: [status, ...orderIds],
      type: QueryTypes.UPDATE
    });

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái ${orderIds.length} đơn hàng thành công`
    });
  } catch (error) {
    console.error('Error in bulkUpdateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái hàng loạt',
      error: error.message
    });
  }
};

// Bulk delete orders
exports.bulkDeleteOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID đơn hàng không hợp lệ'
      });
    }

    const query = `DELETE FROM donhang WHERE id_DonHang IN (${orderIds.map(() => '?').join(',')})`;
    await sequelize.query(query, {
      replacements: orderIds,
      type: QueryTypes.DELETE
    });

    res.json({
      success: true,
      message: `Đã xóa ${orderIds.length} đơn hàng thành công`
    });
  } catch (error) {
    console.error('Error in bulkDeleteOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hàng loạt đơn hàng',
      error: error.message
    });
  }
};

// Get orders summary
exports.getOrdersSummary = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case '7d':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        break;
      case '30d':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        break;
      case '90d':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)';
        break;
      default:
        dateCondition = '';
    }

    const query = `
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN trangThaiDonHang = 'CHO_XAC_NHAN' THEN 1 END) as pending,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_XAC_NHAN' THEN 1 END) as confirmed,
        COUNT(CASE WHEN trangThaiDonHang = 'DANG_GIAO' THEN 1 END) as shipping,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN 1 END) as completed,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_HUY' THEN 1 END) as cancelled,
        COALESCE(SUM(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan END), 0) as totalRevenue,
        COALESCE(AVG(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan END), 0) as avgOrderValue
      FROM donhang 
      ${dateCondition}
    `;

    const [summary] = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        period,
        totalOrders: parseInt(summary.totalOrders),
        pending: parseInt(summary.pending),
        confirmed: parseInt(summary.confirmed),
        shipping: parseInt(summary.shipping),
        completed: parseInt(summary.completed),
        cancelled: parseInt(summary.cancelled),
        totalRevenue: parseFloat(summary.totalRevenue),
        avgOrderValue: parseFloat(summary.avgOrderValue)
      }
    });
  } catch (error) {
    console.error('Error in getOrdersSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng quan đơn hàng',
      error: error.message
    });
  }
};

// Get order trends
exports.getOrderTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    let groupBy = '';
    
    switch (period) {
      case '7d':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        groupBy = 'DATE(ngayDatHang)';
        break;
      case '30d':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        groupBy = 'DATE(ngayDatHang)';
        break;
      case '12m':
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)';
        groupBy = 'DATE_FORMAT(ngayDatHang, "%Y-%m")';
        break;
      default:
        dateCondition = 'WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        groupBy = 'DATE(ngayDatHang)';
    }

    const query = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as orderCount,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN 1 END) as completedOrders,
        COALESCE(SUM(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan END), 0) as revenue
      FROM donhang 
      ${dateCondition}
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `;

    const trends = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        period,
        trends: trends.map(item => ({
          period: item.period,
          orderCount: parseInt(item.orderCount),
          completedOrders: parseInt(item.completedOrders),
          revenue: parseFloat(item.revenue)
        }))
      }
    });
  } catch (error) {
    console.error('Error in getOrderTrends:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy xu hướng đơn hàng',
      error: error.message
    });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case '7d':
        dateCondition = 'AND ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        break;
      case '30d':
        dateCondition = 'AND ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        break;
      case '90d':
        dateCondition = 'AND ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)';
        break;
      default:
        dateCondition = '';
    }

    const query = `
      SELECT 
        COALESCE(SUM(tongThanhToan), 0) as totalRevenue,
        COALESCE(AVG(tongThanhToan), 0) as avgOrderValue,
        COUNT(*) as totalOrders,
        COUNT(DISTINCT id_NguoiDung) as uniqueCustomers,
        COALESCE(SUM(CASE WHEN phuongThucThanhToan = 'TIEN_MAT' THEN tongThanhToan END), 0) as cashRevenue,
        COALESCE(SUM(CASE WHEN phuongThucThanhToan = 'CHUYEN_KHOAN' THEN tongThanhToan END), 0) as transferRevenue,
        COALESCE(SUM(CASE WHEN phuongThucThanhToan = 'THE' THEN tongThanhToan END), 0) as cardRevenue
      FROM donhang 
      WHERE trangThaiDonHang = 'DA_GIAO' ${dateCondition}
    `;

    const [analytics] = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        period,
        totalRevenue: parseFloat(analytics.totalRevenue),
        avgOrderValue: parseFloat(analytics.avgOrderValue),
        totalOrders: parseInt(analytics.totalOrders),
        uniqueCustomers: parseInt(analytics.uniqueCustomers),
        paymentMethods: {
          cash: parseFloat(analytics.cashRevenue),
          transfer: parseFloat(analytics.transferRevenue),
          card: parseFloat(analytics.cardRevenue)
        }
      }
    });
  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy phân tích doanh thu',
      error: error.message
    });
  }
};

// Export orders to Excel (placeholder)
exports.exportOrdersToExcel = async (req, res) => {
  try {
    // TODO: Implement Excel export functionality
    res.json({
      success: false,
      message: 'Chức năng export Excel đang được phát triển'
    });
  } catch (error) {
    console.error('Error in exportOrdersToExcel:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export Excel',
      error: error.message
    });
  }
}; 