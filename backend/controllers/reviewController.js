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
    const { id_SanPham, noiDung, danhGiaSao } = req.body;
    
    // VALIDATION - Kiểm tra dữ liệu đầu vào
    if (!id_SanPham) {
      return res.status(400).json({
        success: false,
        message: 'id_SanPham là bắt buộc'
      });
    }
    
    if (!noiDung || noiDung.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung đánh giá phải có ít nhất 10 ký tự'
      });
    }
    
    if (!danhGiaSao || danhGiaSao < 1 || danhGiaSao > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá sao phải từ 1-5'
      });
    }
    
    console.log('📝 Creating new review:', { id_SanPham, noiDung: noiDung.substring(0, 50) + '...', danhGiaSao });
    
    // Tạo đánh giá mới
    const reviewData = {
      id_SanPham: parseInt(id_SanPham),
      noiDung: noiDung.trim(),
      danhGiaSao: parseInt(danhGiaSao),
      ngayDanhGia: new Date()
    };
    
    // Note: id_NguoiDung và id_ChiTietDH có thể thêm sau khi có authentication
    const review = await Review.create(reviewData);
    
    console.log('✅ Review created successfully:', review.id_DanhGia);
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Đánh giá đã được tạo thành công'
    });
    
  } catch (error) {
    console.error('❌ Error creating review:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tạo đánh giá', 
      error: error.message 
    });
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
    const { productId } = req.params;
    console.log('🔍 Fetching reviews for product:', productId);
    
    // Lấy reviews theo id_SanPham trực tiếp
    const reviews = await Review.findAll({
      where: { id_SanPham: productId },
      order: [['ngayDanhGia', 'DESC']]
    });
    
    console.log('📊 Found reviews for product:', reviews.length);
    
    res.json({
      success: true,
      data: reviews,
      message: `Tìm thấy ${reviews.length} đánh giá cho sản phẩm ${productId}`
    });
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy đánh giá', 
      error: error.message 
    });
  }
}; 