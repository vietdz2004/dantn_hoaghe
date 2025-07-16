const { Voucher, Order, OrderDetail } = require('../models');
const { Op } = require('sequelize');

// Lấy tất cả voucher
exports.getAll = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll({
      include: [Order]
    });
    res.json({
      success: true,
      data: vouchers,
      message: 'Lấy danh sách voucher thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy voucher theo id
exports.getById = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id, {
      include: [Order]
    });
    if (!voucher) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy voucher' 
      });
    }
    res.json({
      success: true,
      data: voucher,
      message: 'Lấy thông tin voucher thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Tạo mới voucher
exports.create = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json({
      success: true,
      data: voucher,
      message: 'Tạo voucher thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Cập nhật voucher
exports.update = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy voucher' 
      });
    }
    await voucher.update(req.body);
    res.json({
      success: true,
      data: voucher,
      message: 'Cập nhật voucher thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Xóa voucher
exports.delete = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy voucher' 
      });
    }
    await voucher.destroy();
    res.json({ 
      success: true,
      message: 'Đã xóa voucher' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy danh sách voucher có sẵn
exports.getAvailable = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.findAll({
      where: {
        ngayBatDau: {
          [Op.lte]: now
        },
        ngayHetHan: {
          [Op.gte]: now
        }
      },
      order: [['giaTriGiam', 'DESC']]
    });
    
    res.json({
      success: true,
      data: vouchers,
      message: `Tìm thấy ${vouchers.length} voucher có sẵn`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Kiểm tra voucher có hợp lệ
exports.validate = async (req, res) => {
  try {
    const { code, orderTotal = 0 } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã voucher'
      });
    }

    const voucher = await Voucher.findOne({
      where: { maVoucher: code.toUpperCase() }
    });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Mã voucher không tồn tại'
      });
    }
    
    const now = new Date();
    
    // Kiểm tra thời gian hiệu lực
    if (voucher.ngayBatDau > now) {
      return res.status(400).json({
        success: false,
        message: 'Voucher chưa có hiệu lực'
      });
    }
    
    if (voucher.ngayHetHan < now) {
      return res.status(400).json({
        success: false,
        message: 'Voucher đã hết hạn'
      });
    }
    
    // Kiểm tra điều kiện áp dụng (nếu có)
    if (voucher.dieuKienApDung) {
      try {
        const conditions = JSON.parse(voucher.dieuKienApDung);
        if (conditions.minOrderTotal && orderTotal < conditions.minOrderTotal) {
          return res.status(400).json({
            success: false,
            message: `Đơn hàng tối thiểu ${conditions.minOrderTotal.toLocaleString('vi-VN')}đ để áp dụng voucher`
          });
        }
      } catch (e) {
        console.warn('Invalid voucher conditions format:', voucher.dieuKienApDung);
      }
    }
    
    res.json({
      success: true,
      data: {
        id_voucher: voucher.id_voucher,
        maVoucher: voucher.maVoucher,
        giaTriGiam: voucher.giaTriGiam,
        dieuKienApDung: voucher.dieuKienApDung,
        ngayBatDau: voucher.ngayBatDau,
        ngayHetHan: voucher.ngayHetHan
      },
      message: 'Voucher hợp lệ'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Áp dụng voucher và tính toán giảm giá
exports.apply = async (req, res) => {
  try {
    const { code, orderTotal, userId, productIds } = req.body;
    
    if (!code || !orderTotal) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin mã voucher hoặc tổng đơn hàng'
      });
    }

    // Validate voucher
    const voucher = await Voucher.findOne({
      where: { maVoucher: code.toUpperCase() }
    });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Mã voucher không tồn tại'
      });
    }
    
    const now = new Date();
    
    // Kiểm tra thời gian hiệu lực
    if (voucher.ngayBatDau > now || voucher.ngayHetHan < now) {
      return res.status(400).json({
        success: false,
        message: 'Voucher không còn hiệu lực'
      });
    }
    
    // Kiểm tra điều kiện áp dụng
    let minOrderTotal = 0;
    if (voucher.dieuKienApDung) {
      try {
        const conditions = JSON.parse(voucher.dieuKienApDung);
        minOrderTotal = conditions.minOrderTotal || 0;
      } catch (e) {
        console.warn('Invalid voucher conditions format:', voucher.dieuKienApDung);
      }
    }
    
    if (orderTotal < minOrderTotal) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${minOrderTotal.toLocaleString('vi-VN')}đ để áp dụng voucher`
      });
    }
    
    // Kiểm tra user đã dùng voucher này cho sản phẩm nào chưa
    if (userId && Array.isArray(productIds) && productIds.length > 0) {
      // Tìm các đơn hàng của user đã dùng voucher này
      const usedOrders = await Order.findAll({
        where: { id_NguoiDung: userId, id_voucher: voucher.id_voucher },
        attributes: ['id_DonHang']
      });
      if (usedOrders.length > 0) {
        const orderIds = usedOrders.map(o => o.id_DonHang);
        // Tìm các sản phẩm đã dùng voucher trong các đơn này
        const usedDetails = await OrderDetail.findAll({
          where: {
            id_DonHang: orderIds,
            id_SanPham: productIds
          }
        });
        if (usedDetails.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Bạn chỉ được áp dụng voucher này 1 lần cho mỗi sản phẩm.'
          });
        }
      }
    }
    
    // Tính toán giảm giá
    const discountAmount = Math.min(voucher.giaTriGiam, orderTotal);
    const finalTotal = Math.max(0, orderTotal - discountAmount);
    
    res.json({
      success: true,
      data: {
        voucher: {
          id_voucher: voucher.id_voucher,
          maVoucher: voucher.maVoucher,
          giaTriGiam: voucher.giaTriGiam
        },
        calculation: {
          originalTotal: orderTotal,
          discountAmount: discountAmount,
          finalTotal: finalTotal
        }
      },
      message: `Áp dụng voucher thành công, giảm ${discountAmount.toLocaleString('vi-VN')}đ`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// API cũ để tương thích
exports.validateVoucher = async (req, res) => {
  return exports.validate(req, res);
}; 