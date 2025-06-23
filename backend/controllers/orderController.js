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
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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
    const query = `
      SELECT 
        o.*,
        COUNT(od.id_ChiTietDH) as itemCount,
        SUM(od.soLuong * od.giaTaiThoiDiem) as calculatedTotal
      FROM donhang o
      LEFT JOIN chitietdonhang od ON o.id_DonHang = od.id_DonHang
      WHERE o.id_NguoiDung = $1
      GROUP BY o.id_DonHang
      ORDER BY o.ngayDatHang DESC
    `;
    
    const orders = await sequelize.query(query, {
      bind: [req.params.userId],
      type: QueryTypes.SELECT
    });
    
    // Get details for each order if needed
    for (let order of orders) {
      const detailsQuery = `
        SELECT 
          od.*,
          p.tenSp,
          p.hinhAnh
        FROM chitietdonhang od
        LEFT JOIN sanpham p ON od.id_SanPham = p.id_SanPham
        WHERE od.id_DonHang = $1
      `;
      
      const details = await sequelize.query(detailsQuery, {
        bind: [order.id_DonHang],
        type: QueryTypes.SELECT
      });
      
      order.OrderDetails = details;
    }
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 