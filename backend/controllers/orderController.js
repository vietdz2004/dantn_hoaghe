const { Order, User, Voucher, OrderDetail, Product } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../models/database');

// Lấy tất cả đơn hàng với RAW SQL filtering, search, pagination, sorting
exports.getAll = async (req, res) => {
  try {
    const {
      // Pagination
      page = 1,
      limit = 20,
      
      // Search
      search,
      
      // Filters
      status,           // CHO_XAC_NHAN, DA_XAC_NHAN, DANG_GIAO, DA_GIAO, DA_HUY
      paymentStatus,    // CHUA_THANH_TOAN, DA_THANH_TOAN, HOAN_TIEN
      paymentMethod,    // TIEN_MAT, CHUYEN_KHOAN, THE
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      userId,           // Filter by specific user
      
      // Sorting
      sortBy = 'createdAt', // createdAt, total, status
      sortOrder = 'DESC'    // ASC, DESC
    } = req.query;

    // Xây dựng WHERE conditions
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Search condition - mã đơn hàng và thông tin khách hàng
    if (search) {
      whereConditions.push(`
        (o.maDonHang LIKE $${paramIndex} OR 
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
    
    // User filter
    if (userId) {
      whereConditions.push(`o.id_NguoiDung = $${paramIndex}`);
      queryParams.push(parseInt(userId));
      paramIndex++;
    }

    // Xây dựng ORDER BY clause
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
    
    // Xây dựng WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Main query để lấy orders với user info
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
    
    // Count query để đếm tổng số
    const countQuery = `
      SELECT COUNT(DISTINCT o.id_DonHang) as total
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      ${whereClause}
    `;

    // Stats query để tính thống kê
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT o.id_DonHang) as total,
        COUNT(CASE WHEN o.trangThaiDonHang = 'CHO_XAC_NHAN' THEN 1 END) as pending,
        COUNT(CASE WHEN o.trangThaiDonHang = 'DA_XAC_NHAN' THEN 1 END) as confirmed,
        COUNT(CASE WHEN o.trangThaiDonHang = 'DANG_GIAO' THEN 1 END) as shipping,
        COUNT(CASE WHEN o.trangThaiDonHang = 'DA_GIAO' THEN 1 END) as completed,
        COUNT(CASE WHEN o.trangThaiDonHang = 'DA_HUY' THEN 1 END) as cancelled,
        COUNT(CASE WHEN DATE(o.ngayDatHang) = CURRENT_DATE THEN 1 END) as todayOrders,
        SUM(CASE WHEN o.trangThaiDonHang = 'DA_GIAO' THEN COALESCE(o.tongThanhToan, 0) ELSE 0 END) as totalRevenue
      FROM donhang o
      LEFT JOIN nguoidung u ON o.id_NguoiDung = u.id_NguoiDung
      ${whereClause}
    `;

    // Execute các queries song song
    queryParams.push(parseInt(limit), offset);
    
    const [orders, countResult, statsResult] = await Promise.all([
      sequelize.query(mainQuery, { 
        bind: queryParams, 
        type: QueryTypes.SELECT 
      }),
      sequelize.query(countQuery, { 
        bind: queryParams.slice(0, -2), // Loại bỏ limit và offset
        type: QueryTypes.SELECT 
      }),
      sequelize.query(statsQuery, { 
        bind: queryParams.slice(0, -2), // Loại bỏ limit và offset
        type: QueryTypes.SELECT 
      })
    ]);

    // Get order details cho từng order (nếu cần)
    const orderIds = orders.map(o => o.id_DonHang);
    let orderDetails = [];
    
    if (orderIds.length > 0) {
      const detailsQuery = `
        SELECT 
          od.*,
          p.tenSp,
          p.hinhAnh,
          p.gia as originalPrice
        FROM chitietdonhang od
        LEFT JOIN sanpham p ON od.id_SanPham = p.id_SanPham
        WHERE od.id_DonHang IN (${orderIds.map((_, i) => `$${i + 1}`).join(',')})
        ORDER BY od.id_DonHang, od.id_ChiTietDH
      `;
      
      orderDetails = await sequelize.query(detailsQuery, {
        bind: orderIds,
        type: QueryTypes.SELECT
      });
    }

    // Gán order details vào từng order
    const ordersWithDetails = orders.map(order => ({
      ...order,
      OrderDetails: orderDetails.filter(detail => detail.id_DonHang === order.id_DonHang)
    }));

    const totalItems = parseInt(countResult[0].total);
    const stats = {
      total: parseInt(statsResult[0].total),
      pending: parseInt(statsResult[0].pending),
      confirmed: parseInt(statsResult[0].confirmed),
      shipping: parseInt(statsResult[0].shipping),
      completed: parseInt(statsResult[0].completed),
      cancelled: parseInt(statsResult[0].cancelled),
      todayOrders: parseInt(statsResult[0].todayOrders),
      totalRevenue: parseFloat(statsResult[0].totalRevenue || 0),
      unpaidOrders: parseInt(statsResult[0].unpaidOrders)
    };
    
    res.json({
      success: true,
      data: ordersWithDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        itemsPerPage: parseInt(limit)
      },
      stats,
      filters: {
        search,
        status,
        paymentStatus,
        paymentMethod,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal,
        userId,
        sortBy,
        sortOrder
      },
      performance: {
        queryExecutionTime: Date.now(),
        sqlOptimized: true
      }
    });
  } catch (error) {
    console.error('Error in getAll orders with SQL:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy đơn hàng theo id với SQL JOIN
exports.getById = async (req, res) => {
  try {
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
      bind: [req.params.id],
      type: QueryTypes.SELECT
    });
    
    if (orderResult.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
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
      bind: [req.params.id],
      type: QueryTypes.SELECT
    });

    const order = {
      ...orderResult[0],
      OrderDetails: orderDetails
    };
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới đơn hàng
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('📦 Creating order with data:', req.body);
    
    const {
      // Thông tin khách hàng
      id_NguoiDung,
      hoTen,
      email,
      soDienThoai,
      diaChi,
      
      // Thông tin giao hàng
      diaChiGiao,
      ghiChu,
      thoiGianGiao,
      ngayGiao,
      gioGiao,
      
      // Thanh toán
      phuongThucThanhToan,
      trangThaiDonHang,
      trangThaiThanhToan,
      
      // Sản phẩm (support both formats)
      sanPham,
      chiTietDonHang,
      
      // Tổng tiền
      tongTienHang,
      phiVanChuyen,
      giaTriGiam,
      tongThanhToan,
      
      // Voucher
      maVoucher
    } = req.body;

    // Use products from either field
    const products = sanPham || chiTietDonHang;

    // Validate required fields
    if (!hoTen || !soDienThoai || !diaChiGiao || !phuongThucThanhToan) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
        missingFields: {
          hoTen: !hoTen,
          soDienThoai: !soDienThoai,
          diaChiGiao: !diaChiGiao,
          phuongThucThanhToan: !phuongThucThanhToan
        }
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống hoặc không hợp lệ'
      });
    }

    // Generate order code
    const orderCode = 'DH' + Date.now();
    
    // Create main order
    const orderData = {
      id_NguoiDung: id_NguoiDung || req.user?.id_NguoiDung || null,
      id_voucher: null, // Nếu có voucher, cần lookup id_voucher từ maVoucher
      ngayDatHang: new Date(),
      phuongThucThanhToan: phuongThucThanhToan,
      soLuong: products.length,
      tongThanhToan: tongThanhToan || 0,
      phiVanChuyen: phiVanChuyen || 0,
      trangThaiDonHang: trangThaiDonHang || 'CHO_XAC_NHAN'
    };

    // Nếu có mã voucher, lookup id_voucher
    if (maVoucher) {
      const voucher = await Voucher.findOne({ where: { maVoucher } });
      if (voucher) orderData.id_voucher = voucher.id_voucher;
    }

    console.log('📝 Creating order with data:', orderData);
    const newOrder = await Order.create(orderData, { transaction });
    console.log('✅ Order created with ID:', newOrder.id_DonHang);

    // Create order details
    const orderDetails = [];
    for (const item of products) {
      const productId = item.id_SanPham;
      const quantity = item.soLuong || item.quantity || 1;
      const price = item.giaTaiThoiDiem || item.gia || 0;
      if (!productId || !quantity || !price) {
        console.warn('⚠️ Invalid product item:', item);
        continue;
      }
      const detailData = {
        id_DonHang: newOrder.id_DonHang,
        id_SanPham: productId,
        soLuongMua: quantity,
        thanhTien: item.thanhTien || (price * quantity),
        donGiaLucMua: price
      };
      console.log('🛍️ Creating order detail:', detailData);
      const orderDetail = await OrderDetail.create(detailData, { transaction });
      orderDetails.push({
        ...orderDetail.toJSON(),
        tenSp: item.tenSp,
        hinhAnh: item.hinhAnh
      });
    }
    await transaction.commit();
    
    console.log('🎉 Order creation successful!');

    // Return complete order with details
    const response = {
      success: true,
      message: 'Đặt hàng thành công',
      data: {
        ...newOrder.toJSON(),
        OrderDetails: orderDetails,
        customerInfo: {
          hoTen,
          email,
          soDienThoai,
          diaChi
        }
      }
    };

    res.status(201).json(response);
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creating order:', error);
    if (error.original) {
      console.error('❌ SQL Error:', error.original.sqlMessage || error.original.message);
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn hàng',
      error: error.message,
      sqlError: error.original ? (error.original.sqlMessage || error.original.message) : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Cập nhật đơn hàng
exports.update = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    await order.update(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa đơn hàng
exports.delete = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    await order.destroy();
    res.json({ message: 'Đã xóa đơn hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy đơn hàng theo người dùng với SQL
exports.getByUser = async (req, res) => {
  try {
    // Simplified query first - just get orders without complex joins
    const query = `
      SELECT o.*
      FROM donhang o
      WHERE o.id_NguoiDung = $1
      ORDER BY o.ngayDatHang DESC
    `;
    
    const orders = await sequelize.query(query, {
      bind: [req.params.userId],
      type: QueryTypes.SELECT
    });
    
    // Add basic structure for compatibility with frontend
    const ordersWithDetails = orders.map(order => ({
      ...order,
      itemCount: 0,
      OrderDetails: []
    }));
    
    res.json(ordersWithDetails);
  } catch (error) {
    console.error('getByUser error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// === ADMIN FUNCTIONS - Các function dành cho admin ===

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status - Kiểm tra trạng thái hợp lệ
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

    await order.update({ trangThaiDonHang: status });
    
    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành ${status}`,
      data: { id, status }
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

// Cập nhật trạng thái hàng loạt
exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    // Validate input - Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
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

    // Cập nhật hàng loạt
    await Order.update(
      { trangThaiDonHang: status },
      { where: { id_DonHang: orderIds } }
    );

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái ${orderIds.length} đơn hàng thành ${status}`
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

// Xóa đơn hàng hàng loạt
exports.bulkDeleteOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID đơn hàng không hợp lệ'
      });
    }

    // Xóa hàng loạt
    await Order.destroy({
      where: { id_DonHang: orderIds }
    });

    res.json({
      success: true,
      message: `Đã xóa ${orderIds.length} đơn hàng thành công`
    });
  } catch (error) {
    console.error('Error in bulkDeleteOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đơn hàng hàng loạt',
      error: error.message
    });
  }
};

// Tổng quan đơn hàng cho admin
exports.getOrdersSummary = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case '7d':
        dateCondition = 'AND o.ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)';
        break;
      case '30d':
        dateCondition = 'AND o.ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)';
        break;
      default:
        dateCondition = '';
    }

    // Query thống kê đơn hàng
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN trangThaiDonHang = 'CHO_XAC_NHAN' THEN 1 END) as pendingOrders,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN 1 END) as completedOrders,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_HUY' THEN 1 END) as cancelledOrders,
        SUM(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as totalRevenue,
        AVG(tongThanhToan) as avgOrderValue,
        COUNT(CASE WHEN DATE(ngayDatHang) = CURRENT_DATE THEN 1 END) as todayOrders
      FROM donhang o
      WHERE 1=1 ${dateCondition}
    `;

    const result = await sequelize.query(summaryQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: result[0],
      message: `Lấy tổng quan đơn hàng ${period} thành công`
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

// Xu hướng đơn hàng theo thời gian
exports.getOrderTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Query xu hướng đơn hàng theo ngày
    const trendsQuery = `
      SELECT 
        DATE(ngayDatHang) as date,
        COUNT(*) as orderCount,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN 1 END) as completedCount,
        SUM(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as revenue
      FROM donhang
      WHERE ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      GROUP BY DATE(ngayDatHang)
      ORDER BY date DESC
      LIMIT 30
    `;

    const trends = await sequelize.query(trendsQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: trends.reverse(), // Đảo ngược để hiển thị từ cũ đến mới
      message: `Lấy xu hướng đơn hàng ${period} thành công`
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

// Thống kê doanh thu
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Query thống kê doanh thu chi tiết
    const revenueQuery = `
      SELECT 
        SUM(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as totalRevenue,
        COUNT(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN 1 END) as paidOrders,
        AVG(CASE WHEN trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan END) as avgOrderValue,
        SUM(CASE WHEN DATE(ngayDatHang) = CURRENT_DATE AND trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as todayRevenue,
        SUM(CASE WHEN ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) AND trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as weekRevenue,
        SUM(CASE WHEN ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) AND trangThaiDonHang = 'DA_GIAO' THEN tongThanhToan ELSE 0 END) as monthRevenue
      FROM donhang
    `;

    const result = await sequelize.query(revenueQuery, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: result[0],
      message: 'Lấy thống kê doanh thu thành công'
    });
  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê doanh thu',
      error: error.message
    });
  }
};

// Export orders to Excel (tạm thời trả về JSON)
exports.exportOrdersToExcel = async (req, res) => {
  try {
    // Lấy tất cả orders để export
    const orders = await Order.findAll({
      order: [['ngayDatHang', 'DESC']],
      include: [
        { model: User, as: 'User', attributes: ['ten', 'email', 'soDienThoai'] }
      ]
    });

    res.json({
      success: true,
      data: orders,
      message: `Export ${orders.length} đơn hàng thành công`
    });
  } catch (error) {
    console.error('Error in exportOrdersToExcel:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export đơn hàng',
      error: error.message
    });
  }
};

// === MODULE EXPORTS - Xuất tất cả functions ===
module.exports = {
  // Basic CRUD - Các function cơ bản
  getAll: exports.getAll,
  getById: exports.getById,
  create: exports.create,
  update: exports.update,
  delete: exports.delete,
  getByUser: exports.getByUser,
  
  // Admin functions - Các function cho admin
  updateOrderStatus: exports.updateOrderStatus,
  bulkUpdateOrderStatus: exports.bulkUpdateOrderStatus,
  bulkDeleteOrders: exports.bulkDeleteOrders,
  getOrdersSummary: exports.getOrdersSummary,
  getOrderTrends: exports.getOrderTrends,
  getRevenueAnalytics: exports.getRevenueAnalytics,
  exportOrdersToExcel: exports.exportOrdersToExcel,
  
  // Alias functions - Tên gọi khác để tương thích
  getAllOrders: exports.getAll,
  getOrderById: exports.getById,
  updateOrder: exports.update,
  deleteOrder: exports.delete
}; 