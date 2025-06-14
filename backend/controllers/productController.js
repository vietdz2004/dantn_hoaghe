const { Product, SubCategory, Category } = require('../models');
const { Op } = require('sequelize');

// Lấy tất cả sản phẩm
exports.getAll = async (req, res) => {
  try {
    // Lọc theo nhiều subcat nếu có
    let where = {};
    let include = [
      {
        model: SubCategory,
        include: [Category]
      }
    ];
    
    if (req.query.subcat) {
      // Hỗ trợ subcat=1,2,3 hoặc subcat=[1,2,3]
      let subcatArr = [];
      if (Array.isArray(req.query.subcat)) {
        subcatArr = req.query.subcat.map(id => Number(id));
      } else if (typeof req.query.subcat === 'string') {
        subcatArr = req.query.subcat.split(',').map(id => Number(id));
      }
      if (subcatArr.length === 1) {
        where.id_DanhMucChiTiet = subcatArr[0];
      } else if (subcatArr.length > 1) {
        where.id_DanhMucChiTiet = { [Op.in]: subcatArr };
      }
    } else if (req.query.cat) {
      // Nếu có cat, lọc theo danh mục cha (id_DanhMuc)
      // Sử dụng include với where thay vì nested where clause
      include = [
        {
          model: SubCategory,
          where: { id_DanhMuc: req.query.cat },
          include: [Category]
        }
      ];
    }
    
    const products = await Product.findAll({
      where,
      include
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy sản phẩm theo id
exports.getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: SubCategory,
          include: [Category]
        }
      ]
    });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới sản phẩm
exports.create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật sản phẩm
exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa sản phẩm
exports.delete = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    await product.destroy();
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy sản phẩm theo danh mục
exports.getByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: SubCategory,
          where: { id_DanhMuc: req.params.categoryId },
          include: [Category]
        }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 