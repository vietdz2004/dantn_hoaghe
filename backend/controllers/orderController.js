const { Order, User, Voucher, OrderDetail, Product } = require('../models');

// Lấy tất cả đơn hàng
exports.getAll = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User },
        { model: Voucher },
        {
          model: OrderDetail,
          include: [Product]
        }
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy đơn hàng theo id
exports.getById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User },
        { model: Voucher },
        {
          model: OrderDetail,
          include: [Product]
        }
      ]
    });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
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

// Lấy đơn hàng theo người dùng
exports.getByUser = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { id_NguoiDung: req.params.userId },
      include: [
        { model: Voucher },
        {
          model: OrderDetail,
          include: [Product]
        }
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 