const { Voucher, Order } = require('../models');

// Lấy tất cả voucher
exports.getAll = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll({
      include: [Order]
    });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy voucher theo id
exports.getById = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id, {
      include: [Order]
    });
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới voucher
exports.create = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json(voucher);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật voucher
exports.update = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    await voucher.update(req.body);
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa voucher
exports.delete = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    await voucher.destroy();
    res.json({ message: 'Đã xóa voucher' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Kiểm tra voucher có hợp lệ
exports.validateVoucher = async (req, res) => {
  try {
    const { maVoucher } = req.body;
    const voucher = await Voucher.findOne({
      where: { maVoucher }
    });
    
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' });
    }
    
    const now = new Date();
    if (voucher.ngayBatDau > now || voucher.ngayHetHan < now) {
      return res.status(400).json({ message: 'Voucher đã hết hạn hoặc chưa có hiệu lực' });
    }
    
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 