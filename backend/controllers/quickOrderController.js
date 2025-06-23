const QuickOrder = require('../models/QuickOrder');
const Product = require('../models/Product');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../models/database');

// Tạo đơn đặt nhanh mới
const createQuickOrder = async (req, res) => {
  try {
    const { 
      tenKhachHang, 
      soDienThoai, 
      maSanPham, 
      soLuong = 1, 
      ghiChu 
    } = req.body;

    // Validation
    if (!tenKhachHang || !soDienThoai || !maSanPham) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Kiểm tra số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(soDienThoai)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ'
      });
    }

    // Lấy thông tin sản phẩm bằng SQL
    const productQuery = `
      SELECT 
        p.*,
        COALESCE(NULLIF(p.giaKhuyenMai, 0), p.gia) as effectivePrice
      FROM sanpham p
      WHERE p.id_SanPham = $1
    `;
    
    const productResult = await sequelize.query(productQuery, {
      bind: [maSanPham],
      type: QueryTypes.SELECT
    });

    if (productResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    const product = productResult[0];

    // Kiểm tra tồn kho
    if (product.soLuongTon < soLuong) {
      return res.status(400).json({
        success: false,
        message: 'Không đủ hàng trong kho'
      });
    }

    // Tính giá (ưu tiên giá khuyến mãi)
    const currentPrice = product.effectivePrice;

    // Kiểm tra đơn trùng lặp trong 5 phút gần đây bằng SQL
    const duplicateQuery = `
      SELECT id 
      FROM quick_orders 
      WHERE soDienThoai = $1 
        AND maSanPham = $2 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      LIMIT 1
    `;
    
    const duplicateResult = await sequelize.query(duplicateQuery, {
      bind: [soDienThoai, maSanPham],
      type: QueryTypes.SELECT
    });

    if (duplicateResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đặt sản phẩm này trong 5 phút gần đây. Vui lòng chờ nhân viên liên hệ.'
      });
    }

    // Tạo đơn đặt nhanh
    const quickOrder = await QuickOrder.create({
      tenKhachHang: tenKhachHang.trim(),
      soDienThoai: soDienThoai.trim(),
      maSanPham,
      tenSanPham: product.tenSp,
      soLuong,
      giaTaiThoiDiem: currentPrice,
      ghiChu: ghiChu ? ghiChu.trim() : null,
      priority: getPriority(currentPrice * soLuong)
    });

    // TODO: Gửi thông báo cho admin/staff
    await notifyStaff(quickOrder);

    res.status(201).json({
      success: true,
      message: 'Đã gửi đơn đặt nhanh thành công! Chúng tôi sẽ liên hệ với bạn trong 5-10 phút.',
      data: {
        maDonNhanh: quickOrder.maDonNhanh,
        tongTien: quickOrder.tongTien,
        trangThai: quickOrder.trangThai
      }
    });

  } catch (error) {
    console.error('Error creating quick order:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo đơn hàng'
    });
  }
};

// Lấy danh sách đơn đặt nhanh với RAW SQL filtering, search, pagination, sorting
const getQuickOrders = async (req, res) => {
  try {
    const { 
      // Pagination
      page = 1, 
      limit = 20, 
      
      // Search
      search, // Enhanced search
      
      // Filters
      status,           // DANG_CHO, DA_LIEN_HE, HOAN_THANH, DA_HUY
      priority,         // 1, 2, 3, 4, 5 (1 = highest priority)
      soDienThoai,
      dateFrom,         // tuNgay -> dateFrom
      dateTo,           // denNgay -> dateTo
      minTotal,         // Lọc theo tổng tiền tối thiểu
      maxTotal,         // Lọc theo tổng tiền tối đa
      nhanVienXuLy,     // Lọc theo nhân viên xử lý
      
      // Sorting
      sortBy = 'priority', // priority, createdAt, tongTien
      sortOrder = 'ASC'    // ASC, DESC
    } = req.query;

    // Xây dựng WHERE conditions
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Enhanced search - tìm kiếm theo nhiều trường
    if (search) {
      whereConditions.push(`
        (qo.tenKhachHang LIKE $${paramIndex} OR 
         qo.soDienThoai LIKE $${paramIndex + 1} OR 
         qo.maDonNhanh LIKE $${paramIndex + 2} OR 
         qo.tenSanPham LIKE $${paramIndex + 3} OR 
         qo.ghiChu LIKE $${paramIndex + 4})
      `);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      paramIndex += 5;
    }
    
    // Status filter
    if (status) {
      whereConditions.push(`qo.trangThai = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    // Priority filter
    if (priority) {
      whereConditions.push(`qo.priority = $${paramIndex}`);
      queryParams.push(parseInt(priority));
      paramIndex++;
    }
    
    // Phone filter (separate from search)
    if (soDienThoai && !search) {
      whereConditions.push(`qo.soDienThoai LIKE $${paramIndex}`);
      queryParams.push(`%${soDienThoai}%`);
      paramIndex++;
    }
    
    // Date range filter
    if (dateFrom && dateTo) {
      whereConditions.push(`qo.createdAt BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      queryParams.push(new Date(dateFrom), new Date(dateTo));
      paramIndex += 2;
    } else if (dateFrom) {
      whereConditions.push(`qo.createdAt >= $${paramIndex}`);
      queryParams.push(new Date(dateFrom));
      paramIndex++;
    } else if (dateTo) {
      whereConditions.push(`qo.createdAt <= $${paramIndex}`);
      queryParams.push(new Date(dateTo));
      paramIndex++;
    }
    
    // Total amount filter
    if (minTotal || maxTotal) {
      if (minTotal && maxTotal) {
        whereConditions.push(`qo.tongTien BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        queryParams.push(parseFloat(minTotal), parseFloat(maxTotal));
        paramIndex += 2;
      } else if (minTotal) {
        whereConditions.push(`qo.tongTien >= $${paramIndex}`);
        queryParams.push(parseFloat(minTotal));
        paramIndex++;
      } else if (maxTotal) {
        whereConditions.push(`qo.tongTien <= $${paramIndex}`);
        queryParams.push(parseFloat(maxTotal));
        paramIndex++;
      }
    }
    
    // Staff filter
    if (nhanVienXuLy) {
      whereConditions.push(`qo.nhanVienXuLy = $${paramIndex}`);
      queryParams.push(nhanVienXuLy);
      paramIndex++;
    }

    // Xây dựng ORDER BY clause
    let orderClause = '';
    switch (sortBy) {
      case 'priority':
        orderClause = `ORDER BY qo.priority ${sortOrder.toUpperCase()}, qo.createdAt DESC`;
        break;
      case 'tongTien':
        orderClause = `ORDER BY qo.tongTien ${sortOrder.toUpperCase()}`;
        break;
      case 'createdAt':
      default:
        orderClause = `ORDER BY qo.createdAt ${sortOrder.toUpperCase()}`;
        break;
    }
    
    // Xây dựng WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Main query để lấy quick orders với product info
    const mainQuery = `
      SELECT 
        qo.*,
        p.hinhAnh as productImage,
        p.gia as originalPrice,
        p.soLuongTon as stockQuantity,
        CASE 
          WHEN qo.priority <= 2 THEN 'HIGH'
          WHEN qo.priority <= 3 THEN 'MEDIUM'
          ELSE 'LOW'
        END as priorityLevel,
        CASE 
          WHEN qo.createdAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN true
          ELSE false
        END as isNew,
        TIMESTAMPDIFF(MINUTE, qo.createdAt, NOW()) as minutesAgo
      FROM quick_orders qo
      LEFT JOIN sanpham p ON qo.maSanPham = p.id_SanPham
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    // Count query để đếm tổng số
    const countQuery = `
      SELECT COUNT(*) as total
      FROM quick_orders qo
      LEFT JOIN sanpham p ON qo.maSanPham = p.id_SanPham
      ${whereClause}
    `;

    // Stats query để tính thống kê
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN qo.trangThai = 'DANG_CHO' THEN 1 END) as pending,
        COUNT(CASE WHEN qo.trangThai = 'DA_LIEN_HE' THEN 1 END) as contacted,
        COUNT(CASE WHEN qo.trangThai = 'HOAN_THANH' THEN 1 END) as completed,
        COUNT(CASE WHEN qo.trangThai = 'DA_HUY' THEN 1 END) as cancelled,
        COUNT(CASE WHEN DATE(qo.createdAt) = CURRENT_DATE THEN 1 END) as todayOrders,
        COUNT(CASE WHEN qo.priority <= 2 THEN 1 END) as urgent,
        SUM(CASE WHEN qo.trangThai = 'HOAN_THANH' THEN COALESCE(qo.tongTien, 0) ELSE 0 END) as totalValue,
        AVG(CASE WHEN qo.trangThai = 'DA_LIEN_HE' AND qo.thoiGianLienHe IS NOT NULL 
                 THEN TIMESTAMPDIFF(MINUTE, qo.createdAt, qo.thoiGianLienHe) END) as avgResponseTime
      FROM quick_orders qo
      LEFT JOIN sanpham p ON qo.maSanPham = p.id_SanPham
      ${whereClause}
    `;

    // Execute các queries song song
    queryParams.push(parseInt(limit), offset);
    
    const [quickOrders, countResult, statsResult] = await Promise.all([
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
      pending: parseInt(statsResult[0].pending),
      contacted: parseInt(statsResult[0].contacted),
      completed: parseInt(statsResult[0].completed),
      cancelled: parseInt(statsResult[0].cancelled),
      todayOrders: parseInt(statsResult[0].todayOrders),
      urgent: parseInt(statsResult[0].urgent), // Priority 1-2 is urgent
      totalValue: parseFloat(statsResult[0].totalValue || 0),
      avgResponseTime: parseFloat(statsResult[0].avgResponseTime || 0)
    };

    res.json({
      success: true,
      data: quickOrders,
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
        priority,
        soDienThoai,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal,
        nhanVienXuLy,
        sortBy,
        sortOrder
      },
      performance: {
        queryExecutionTime: Date.now(),
        sqlOptimized: true,
        responseTimeAnalysis: stats.avgResponseTime > 0 ? `Trung bình ${Math.round(stats.avgResponseTime)} phút` : 'Chưa có dữ liệu'
      }
    });

  } catch (error) {
    console.error('Error fetching quick orders with SQL:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng'
    });
  }
};

// Cập nhật trạng thái đơn đặt nhanh
const updateQuickOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      trangThai, 
      ghiChu, 
      diaChiGiao, 
      thoiGianGiao,
      nhanVienXuLy 
    } = req.body;

    const quickOrder = await QuickOrder.findByPk(id);
    if (!quickOrder) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const updateData = {};
    
    if (trangThai) {
      updateData.trangThai = trangThai;
      if (trangThai === 'DA_LIEN_HE') {
        updateData.thoiGianLienHe = new Date();
      }
    }
    
    if (ghiChu !== undefined) updateData.ghiChu = ghiChu;
    if (diaChiGiao) updateData.diaChiGiao = diaChiGiao;
    if (thoiGianGiao) updateData.thoiGianGiao = new Date(thoiGianGiao);
    if (nhanVienXuLy) updateData.nhanVienXuLy = nhanVienXuLy;

    await quickOrder.update(updateData);

    res.json({
      success: true,
      message: 'Cập nhật đơn hàng thành công',
      data: quickOrder
    });

  } catch (error) {
    console.error('Error updating quick order:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật đơn hàng'
    });
  }
};

// Lấy quick order theo ID với SQL
const getQuickOrderById = async (req, res) => {
  try {
    const query = `
      SELECT 
        qo.*,
        p.tenSp,
        p.hinhAnh as productImage,
        p.gia as originalPrice,
        p.soLuongTon as stockQuantity,
        p.maSKU,
        CASE 
          WHEN qo.priority <= 2 THEN 'HIGH'
          WHEN qo.priority <= 3 THEN 'MEDIUM'
          ELSE 'LOW'
        END as priorityLevel,
        TIMESTAMPDIFF(MINUTE, qo.createdAt, NOW()) as minutesAgo,
        CASE 
          WHEN qo.thoiGianLienHe IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, qo.createdAt, qo.thoiGianLienHe)
          ELSE NULL
        END as responseTimeMinutes
      FROM quick_orders qo
      LEFT JOIN sanpham p ON qo.maSanPham = p.id_SanPham
      WHERE qo.id = $1
    `;
    
    const result = await sequelize.query(query, {
      bind: [req.params.id],
      type: QueryTypes.SELECT
    });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn đặt nhanh'
      });
    }
    
    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error fetching quick order by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin đơn hàng'
    });
  }
};

// Lấy thống kê chi tiết quick orders với SQL
const getQuickOrderStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case '7d':
        dateCondition = 'AND qo.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateCondition = 'AND qo.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateCondition = 'AND qo.createdAt >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
        break;
      default:
        dateCondition = '';
    }

    const query = `
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN trangThai = 'HOAN_THANH' THEN 1 END) as completedOrders,
        COUNT(CASE WHEN trangThai = 'DANG_CHO' THEN 1 END) as pendingOrders,
        COUNT(CASE WHEN priority <= 2 THEN 1 END) as urgentOrders,
        AVG(CASE WHEN thoiGianLienHe IS NOT NULL 
                 THEN TIMESTAMPDIFF(MINUTE, createdAt, thoiGianLienHe) END) as avgResponseTime,
        SUM(CASE WHEN trangThai = 'HOAN_THANH' THEN tongTien ELSE 0 END) as totalRevenue,
        AVG(tongTien) as avgOrderValue,
        COUNT(DISTINCT soDienThoai) as uniqueCustomers,
        COUNT(CASE WHEN DATE(createdAt) = CURRENT_DATE THEN 1 END) as todayOrders
      FROM quick_orders qo
      WHERE 1=1 ${dateCondition}
    `;
    
    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    
    // Get trend data
    const trendQuery = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as orders,
        COUNT(CASE WHEN trangThai = 'HOAN_THANH' THEN 1 END) as completed,
        SUM(CASE WHEN trangThai = 'HOAN_THANH' THEN tongTien ELSE 0 END) as revenue
      FROM quick_orders
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    `;
    
    const trendResult = await sequelize.query(trendQuery, {
      type: QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: {
        summary: result[0],
        trends: trendResult.reverse() // Đảo ngược để hiển thị từ cũ đến mới
      }
    });
  } catch (error) {
    console.error('Error fetching quick order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thống kê'
    });
  }
};

// Helper functions
const getPriority = (totalValue) => {
  if (totalValue >= 1000000) return 1;
  if (totalValue >= 500000) return 2;
  if (totalValue >= 200000) return 3;
  return 5;
};

const notifyStaff = async (quickOrder) => {
  try {
    console.log(`New quick order: ${quickOrder.maDonNhanh} - ${quickOrder.tenKhachHang}`);
    // TODO: Implement real notification system
  } catch (error) {
    console.error('Error notifying staff:', error);
  }
};

module.exports = {
  createQuickOrder,
  getQuickOrders,
  updateQuickOrderStatus,
  getQuickOrderById,
  getQuickOrderStats
}; 