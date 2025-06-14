const { Review, OrderDetail, Product } = require('../models');

// Lấy tất cả đánh giá
exports.getAll = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: OrderDetail,
          include: [Product]
        }
      ]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy đánh giá theo id
exports.getById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        {
          model: OrderDetail,
          include: [Product]
        }
      ]
    });
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới đánh giá
exports.create = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật đánh giá
exports.update = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    await review.update(req.body);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa đánh giá
exports.delete = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    await review.destroy();
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy đánh giá theo sản phẩm
exports.getByProduct = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: OrderDetail,
          where: { id_SanPham: req.params.productId },
          include: [Product]
        }
      ]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 