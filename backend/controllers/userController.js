const { User } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../models/database');

// Lấy tất cả người dùng với RAW SQL filtering, search, pagination, sorting
exports.getAll = async (req, res) => {
  try {
    const {
      // Pagination
      page = 1,
      limit = 20,
      
      // Search
      search,
      
      // Filters
      status,           // HOAT_DONG, TAM_KHOA, DA_KHOA
      vaiTro,          // KHACH_HANG, NHAN_VIEN, QUAN_LY
      dateFrom,
      dateTo,
      province,        // Tỉnh thành
      
      // Sorting
      sortBy = 'ngayTao', // ngayTao, ten, email
      sortOrder = 'DESC'    // ASC, DESC
    } = req.query;

    // Xây dựng WHERE conditions
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Search condition - tìm kiếm theo tên, email, SĐT, địa chỉ
    if (search) {
      whereConditions.push(`
        (u.ten LIKE $${paramIndex} OR 
         u.email LIKE $${paramIndex + 1} OR 
         u.soDienThoai LIKE $${paramIndex + 2} OR 
         u.diaChi LIKE $${paramIndex + 3})
      `);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      paramIndex += 4;
    }
    
    // Status filter
    if (status) {
      whereConditions.push(`u.trangThai = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    // Role filter
    if (vaiTro) {
      whereConditions.push(`u.vaiTro = $${paramIndex}`);
      queryParams.push(vaiTro);
      paramIndex++;
    }
    
    // Date range filter (registration date)
    if (dateFrom && dateTo) {
      whereConditions.push(`u.ngayTao BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      queryParams.push(new Date(dateFrom), new Date(dateTo));
      paramIndex += 2;
    } else if (dateFrom) {
      whereConditions.push(`u.ngayTao >= $${paramIndex}`);
      queryParams.push(new Date(dateFrom));
      paramIndex++;
    } else if (dateTo) {
      whereConditions.push(`u.ngayTao <= $${paramIndex}`);
      queryParams.push(new Date(dateTo));
      paramIndex++;
    }
    
    // Province filter
    if (province) {
      whereConditions.push(`u.diaChi LIKE $${paramIndex}`);
      queryParams.push(`%${province}%`);
      paramIndex++;
    }

    // Xây dựng ORDER BY clause
    let orderClause = '';
    switch (sortBy) {
      case 'ten':
        orderClause = `ORDER BY u.ten ${sortOrder.toUpperCase()}`;
        break;
      case 'email':
        orderClause = `ORDER BY u.email ${sortOrder.toUpperCase()}`;
        break;
      case 'ngayTao':
      default:
        orderClause = `ORDER BY u.ngayTao ${sortOrder.toUpperCase()}`;
        break;
    }
    
    // Xây dựng WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Main query để lấy users (loại bỏ password)
    const mainQuery = `
      SELECT 
        u.id_NguoiDung,
        u.ten,
        u.email,
        u.soDienThoai,
        u.diaChi,
        u.vaiTro,
        u.trangThai,
        u.ngayTao,
        COUNT(o.id_DonHang) as totalOrders,
        SUM(CASE WHEN o.trangThaiDonHang = 'DA_GIAO' THEN COALESCE(o.tongThanhToan, 0) ELSE 0 END) as totalSpent,
        MAX(o.ngayDatHang) as lastOrderDate
      FROM nguoidung u
      LEFT JOIN donhang o ON u.id_NguoiDung = o.id_NguoiDung
      ${whereClause}
      GROUP BY u.id_NguoiDung
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    // Count query để đếm tổng số
    const countQuery = `
      SELECT COUNT(*) as total
      FROM nguoidung u
      ${whereClause}
    `;

    // Stats query để tính thống kê
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN u.trangThai = 'HOAT_DONG' THEN 1 END) as active,
        COUNT(CASE WHEN u.trangThai = 'DA_KHOA' THEN 1 END) as locked,
        COUNT(CASE WHEN u.trangThai = 'TAM_KHOA' THEN 1 END) as suspended,
        COUNT(CASE WHEN u.vaiTro = 'KHACH_HANG' THEN 1 END) as customers,
        COUNT(CASE WHEN u.vaiTro = 'NHAN_VIEN' THEN 1 END) as staff,
        COUNT(CASE WHEN u.vaiTro = 'QUAN_LY' THEN 1 END) as managers,
        COUNT(CASE WHEN DATE(u.ngayTao) = CURRENT_DATE THEN 1 END) as newToday,
        COUNT(CASE WHEN u.ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 1 END) as newThisMonth
      FROM nguoidung u
      ${whereClause}
    `;

    // Execute các queries song song
    queryParams.push(parseInt(limit), offset);
    
    const [users, countResult, statsResult] = await Promise.all([
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

    const totalItems = parseInt(countResult[0].total);
    const stats = {
      total: parseInt(statsResult[0].total),
      active: parseInt(statsResult[0].active),
      locked: parseInt(statsResult[0].locked),
      suspended: parseInt(statsResult[0].suspended),
      customers: parseInt(statsResult[0].customers),
      staff: parseInt(statsResult[0].staff),
      managers: parseInt(statsResult[0].managers),
      newToday: parseInt(statsResult[0].newToday),
      newThisMonth: parseInt(statsResult[0].newThisMonth)
    };
    
    res.json({
      success: true,
      data: users,
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
        vaiTro,
        dateFrom,
        dateTo,
        province,
        sortBy,
        sortOrder
      },
      performance: {
        queryExecutionTime: Date.now(),
        sqlOptimized: true
      }
    });
  } catch (error) {
    console.error('Error in getAll users with SQL:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy người dùng theo id với SQL (loại bỏ password)
exports.getById = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id_NguoiDung,
        u.ten,
        u.email,
        u.soDienThoai,
        u.diaChi,
        u.vaiTro,
        u.trangThai,
        u.ngayTao,
        COUNT(o.id_DonHang) as totalOrders,
        SUM(CASE WHEN o.trangThaiDonHang = 'DA_GIAO' THEN COALESCE(o.tongThanhToan, 0) ELSE 0 END) as totalSpent,
        MAX(o.ngayDatHang) as lastOrderDate,
        AVG(CASE WHEN o.trangThaiDonHang = 'DA_GIAO' THEN COALESCE(o.tongThanhToan, 0) END) as avgOrderValue
      FROM nguoidung u
      LEFT JOIN donhang o ON u.id_NguoiDung = o.id_NguoiDung
      WHERE u.id_NguoiDung = $1
      GROUP BY u.id_NguoiDung
    `;
    
    const result = await sequelize.query(query, {
      bind: [req.params.id],
      type: QueryTypes.SELECT
    });
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Get recent orders for this user
    const recentOrdersQuery = `
      SELECT 
        o.id_DonHang,
        o.tongThanhToan,
        o.trangThaiDonHang,
        o.ngayDatHang
      FROM donhang o
      WHERE o.id_NguoiDung = $1
      ORDER BY o.ngayDatHang DESC
      LIMIT 5
    `;
    
    const recentOrders = await sequelize.query(recentOrdersQuery, {
      bind: [req.params.id],
      type: QueryTypes.SELECT
    });

    const user = {
      ...result[0],
      recentOrders
    };
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới người dùng
exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    
    // Lấy user vừa tạo nhưng loại bỏ password
    const query = `
      SELECT 
        u.id_NguoiDung,
        u.ten,
        u.email,
        u.soDienThoai,
        u.diaChi,
        u.vaiTro,
        u.trangThai,
        u.ngayTao
      FROM nguoidung u
      WHERE u.id_NguoiDung = $1
    `;
    
    const result = await sequelize.query(query, {
      bind: [user.id_NguoiDung],
      type: QueryTypes.SELECT
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công!',
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Cập nhật người dùng
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    
    await user.update(req.body);
    
    // Lấy user đã cập nhật nhưng loại bỏ password
    const query = `
      SELECT 
        u.id_NguoiDung,
        u.ten,
        u.email,
        u.soDienThoai,
        u.diaChi,
        u.vaiTro,
        u.trangThai,
        u.ngayTao
      FROM nguoidung u
      WHERE u.id_NguoiDung = $1
    `;
    
    const result = await sequelize.query(query, {
      bind: [req.params.id],
      type: QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công!',
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa người dùng
exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    await user.destroy();
    res.json({ message: 'Đã xóa người dùng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thống kê chi tiết người dùng với SQL
exports.getUserStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM nguoidung WHERE trangThai = 'HOAT_DONG') as activeUsers,
        (SELECT COUNT(*) FROM nguoidung WHERE vaiTro = 'KHACH_HANG') as customers,
        (SELECT COUNT(*) FROM nguoidung WHERE DATE(ngayTao) = CURRENT_DATE) as newToday,
        (SELECT COUNT(*) FROM nguoidung WHERE ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)) as newThisWeek,
        (SELECT COUNT(*) FROM nguoidung WHERE ngayTao >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)) as newThisMonth,
        (SELECT AVG(totalSpent) FROM (
          SELECT u.id_NguoiDung, SUM(o.tongThanhToan) as totalSpent
          FROM nguoidung u
          LEFT JOIN donhang o ON u.id_NguoiDung = o.id_NguoiDung AND o.trangThaiDonHang = 'DA_GIAO'
          GROUP BY u.id_NguoiDung
        ) as userSpending) as avgCustomerValue
    `;
    
    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 