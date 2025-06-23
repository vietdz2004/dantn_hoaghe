const { sequelize } = require('../../models/database');
const { QueryTypes } = require('sequelize');
const { Product, Category, SubCategory } = require('../../models');
const fs = require('fs');
const path = require('path');

// Generate SKU
function generateSKU() {
  const prefix = 'SKU';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// Get all products with advanced filtering
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      subCategory,
      status,
      stockStatus,
      priceRange,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build WHERE conditions
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Search condition
    if (search) {
      whereConditions.push(`(p.tenSp LIKE $${paramIndex} OR p.maSKU LIKE $${paramIndex + 1} OR p.thuongHieu LIKE $${paramIndex + 2})`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    // Category filter
    if (category) {
      whereConditions.push(`c.id_DanhMuc = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    // SubCategory filter
    if (subCategory) {
      whereConditions.push(`p.id_DanhMucChiTiet = $${paramIndex}`);
      queryParams.push(subCategory);
      paramIndex++;
    }

    // Status filter
    if (status) {
      whereConditions.push(`p.trangThai = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case 'low':
          whereConditions.push('p.soLuongTon <= p.soLuongToiThieu');
          break;
        case 'out':
          whereConditions.push('p.soLuongTon = 0');
          break;
        case 'good':
          whereConditions.push('p.soLuongTon > p.soLuongToiThieu');
          break;
      }
    }

    // Price range filter
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => parseFloat(p));
      if (min && max) {
        whereConditions.push(`COALESCE(p.giaKhuyenMai, p.gia) BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        queryParams.push(min, max);
        paramIndex += 2;
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    const validSortFields = {
      'name': 'p.tenSp',
      'price': 'COALESCE(p.giaKhuyenMai, p.gia)',
      'stock': 'p.soLuongTon',
      'status': 'p.trangThai',
      'createdAt': 'p.id_SanPham'
    };
    
    const sortField = validSortFields[sortBy] || 'p.id_SanPham';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const query = `
      SELECT 
        p.*,
        sc.tenDanhMucChiTiet,
        c.tenDanhMuc,
        COALESCE(p.giaKhuyenMai, p.gia) as effectivePrice,
        CASE 
          WHEN p.giaKhuyenMai IS NOT NULL AND p.giaKhuyenMai > 0 AND p.giaKhuyenMai < p.gia 
          THEN ROUND(((p.gia - p.giaKhuyenMai) / p.gia) * 100, 0)
          ELSE 0 
        END as discountPercent,
        CASE 
          WHEN p.soLuongTon = 0 THEN 'out_of_stock'
          WHEN p.soLuongTon <= p.soLuongToiThieu THEN 'low_stock'
          ELSE 'good_stock'
        END as stockStatus
      FROM sanpham p
      LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
      ${whereClause}
      ORDER BY ${sortField} ${orderDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sanpham p
      LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
      ${whereClause}
    `;

    queryParams.push(parseInt(limit), offset);

    const [products, countResult] = await Promise.all([
      sequelize.query(query, {
        bind: queryParams,
        type: QueryTypes.SELECT
      }),
      sequelize.query(countQuery, {
        bind: queryParams.slice(0, -2),
        type: QueryTypes.SELECT
      })
    ]);

    const total = countResult[0].total;

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      filters: { search, category, subCategory, status, stockStatus, priceRange, sortBy, sortOrder }
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        sc.tenDanhMucChiTiet,
        c.id_DanhMuc,
        c.tenDanhMuc,
        COALESCE(p.giaKhuyenMai, p.gia) as effectivePrice,
        CASE 
          WHEN p.giaKhuyenMai IS NOT NULL AND p.giaKhuyenMai > 0 AND p.giaKhuyenMai < p.gia 
          THEN ROUND(((p.gia - p.giaKhuyenMai) / p.gia) * 100, 0)
          ELSE 0 
        END as discountPercent
      FROM sanpham p
      LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
      WHERE p.id_SanPham = ?
    `;

    const results = await sequelize.query(query, {
      replacements: [id],
      type: QueryTypes.SELECT
    });

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết sản phẩm',
      error: error.message
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      maSKU: req.body.sku || generateSKU(),
      tenSp: req.body.name || req.body.tenSp,
      moTa: req.body.description || req.body.moTa || '',
      hinhAnh: req.file ? `/images/products/${req.file.filename}` : req.body.image || '',
      thuongHieu: req.body.brand || req.body.thuongHieu || '',
      gia: parseFloat(req.body.price || req.body.gia) || 0,
      giaKhuyenMai: req.body.salePrice || req.body.giaKhuyenMai ? parseFloat(req.body.salePrice || req.body.giaKhuyenMai) : null,
      soLuongTon: parseInt(req.body.stock || req.body.soLuongTon) || 0,
      soLuongToiThieu: parseInt(req.body.minStock || req.body.soLuongToiThieu) || 5,
      trangThai: req.body.status || req.body.trangThai || 'active',
      id_DanhMucChiTiet: parseInt(req.body.subCategoryId || req.body.id_DanhMucChiTiet),
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      seoKeywords: req.body.seoKeywords,
      slug: req.body.slug
    };

    // Validate required fields
    if (!productData.tenSp) {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm không được để trống'
      });
    }

    if (!productData.id_DanhMucChiTiet) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn danh mục sản phẩm'
      });
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.hinhAnh = `/images/products/${req.file.filename}`;
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    await product.update(updateData);

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Delete image file if exists
    if (product.hinhAnh) {
      const imagePath = path.join(__dirname, '../../public', product.hinhAnh);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
};

// Bulk delete products
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID sản phẩm không hợp lệ'
      });
    }

    const query = `DELETE FROM sanpham WHERE id_SanPham IN (${productIds.map(() => '?').join(',')})`;
    const result = await sequelize.query(query, {
      replacements: productIds,
      type: QueryTypes.DELETE
    });

    res.json({
      success: true,
      message: `Đã xóa ${productIds.length} sản phẩm thành công`
    });
  } catch (error) {
    console.error('Error in bulkDeleteProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hàng loạt sản phẩm',
      error: error.message
    });
  }
};

// Bulk update status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { productIds, status } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID sản phẩm không hợp lệ'
      });
    }

    if (!['active', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const query = `UPDATE sanpham SET trangThai = ? WHERE id_SanPham IN (${productIds.map(() => '?').join(',')})`;
    await sequelize.query(query, {
      replacements: [status, ...productIds],
      type: QueryTypes.UPDATE
    });

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái ${productIds.length} sản phẩm thành công`
    });
  } catch (error) {
    console.error('Error in bulkUpdateStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái hàng loạt',
      error: error.message
    });
  }
};

// Bulk update stock
exports.bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, stock}
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu cập nhật không hợp lệ'
      });
    }

    for (const update of updates) {
      await sequelize.query(
        'UPDATE sanpham SET soLuongTon = ? WHERE id_SanPham = ?',
        {
          replacements: [update.stock, update.id],
          type: QueryTypes.UPDATE
        }
      );
    }

    res.json({
      success: true,
      message: `Đã cập nhật kho ${updates.length} sản phẩm thành công`
    });
  } catch (error) {
    console.error('Error in bulkUpdateStock:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật kho hàng loạt',
      error: error.message
    });
  }
};

// Toggle product status
exports.toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const newStatus = product.trangThai === 'active' ? 'hidden' : 'active';
    await product.update({ trangThai: newStatus });

    res.json({
      success: true,
      message: `Đã ${newStatus === 'active' ? 'hiển thị' : 'ẩn'} sản phẩm`,
      data: { status: newStatus }
    });
  } catch (error) {
    console.error('Error in toggleProductStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái sản phẩm',
      error: error.message
    });
  }
};

// Update product stock
exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, minStock } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const updateData = {};
    if (stock !== undefined) updateData.soLuongTon = parseInt(stock);
    if (minStock !== undefined) updateData.soLuongToiThieu = parseInt(minStock);

    await product.update(updateData);

    res.json({
      success: true,
      message: 'Cập nhật kho thành công',
      data: product
    });
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật kho',
      error: error.message
    });
  }
};

// Get product categories
exports.getProductCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [SubCategory],
      order: [['tenDanhMuc', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in getProductCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh mục',
      error: error.message
    });
  }
};

// Get subcategories by category
exports.getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const subCategories = await SubCategory.findAll({
      where: { id_DanhMuc: categoryId },
      order: [['tenDanhMucChiTiet', 'ASC']]
    });

    res.json({
      success: true,
      data: subCategories
    });
  } catch (error) {
    console.error('Error in getSubCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh mục con',
      error: error.message
    });
  }
};

// Advanced search
exports.advancedSearch = async (req, res) => {
  try {
    const {
      keyword,
      categoryId,
      priceMin,
      priceMax,
      stockStatus,
      hasDiscount,
      page = 1,
      limit = 20
    } = req.query;

    // Build complex search query
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    if (keyword) {
      whereConditions.push(`(p.tenSp LIKE $${paramIndex} OR p.moTa LIKE $${paramIndex + 1} OR p.maSKU LIKE $${paramIndex + 2})`);
      const searchTerm = `%${keyword}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    if (categoryId) {
      whereConditions.push(`c.id_DanhMuc = $${paramIndex}`);
      queryParams.push(categoryId);
      paramIndex++;
    }

    if (priceMin) {
      whereConditions.push(`COALESCE(p.giaKhuyenMai, p.gia) >= $${paramIndex}`);
      queryParams.push(parseFloat(priceMin));
      paramIndex++;
    }

    if (priceMax) {
      whereConditions.push(`COALESCE(p.giaKhuyenMai, p.gia) <= $${paramIndex}`);
      queryParams.push(parseFloat(priceMax));
      paramIndex++;
    }

    if (stockStatus === 'low') {
      whereConditions.push('p.soLuongTon <= p.soLuongToiThieu');
    } else if (stockStatus === 'out') {
      whereConditions.push('p.soLuongTon = 0');
    }

    if (hasDiscount === 'true') {
      whereConditions.push('p.giaKhuyenMai IS NOT NULL AND p.giaKhuyenMai > 0 AND p.giaKhuyenMai < p.gia');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `
      SELECT 
        p.*,
        sc.tenDanhMucChiTiet,
        c.tenDanhMuc,
        COALESCE(p.giaKhuyenMai, p.gia) as effectivePrice
      FROM sanpham p
      LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
      ${whereClause}
      ORDER BY p.id_SanPham DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parseInt(limit), offset);

    const products = await sequelize.query(query, {
      bind: queryParams,
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: products,
      searchParams: { keyword, categoryId, priceMin, priceMax, stockStatus, hasDiscount }
    });
  } catch (error) {
    console.error('Error in advancedSearch:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm nâng cao',
      error: error.message
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `
      SELECT 
        p.*,
        sc.tenDanhMucChiTiet,
        c.tenDanhMuc
      FROM sanpham p
      LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
      WHERE c.id_DanhMuc = ?
      ORDER BY p.id_SanPham DESC
      LIMIT ? OFFSET ?
    `;

    const products = await sequelize.query(query, {
      replacements: [categoryId, parseInt(limit), offset],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm theo danh mục',
      error: error.message
    });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const query = `
      SELECT 
        p.*,
        sc.tenDanhMucChiTiet,
        c.tenDanhMuc,
        (p.soLuongToiThieu - p.soLuongTon) as deficit
      FROM sanpham p
      LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
      WHERE p.soLuongTon <= p.soLuongToiThieu AND p.trangThai = 'active'
      ORDER BY deficit DESC, p.soLuongTon ASC
      LIMIT ?
    `;

    const products = await sequelize.query(query, {
      replacements: [parseInt(limit)],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error in getLowStockProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm sắp hết hàng',
      error: error.message
    });
  }
};

// Get out of stock products
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const query = `
      SELECT 
        p.*,
        sc.tenDanhMucChiTiet,
        c.tenDanhMuc
      FROM sanpham p
      LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
      WHERE p.soLuongTon = 0 AND p.trangThai = 'active'
      ORDER BY p.id_SanPham DESC
      LIMIT ?
    `;

    const products = await sequelize.query(query, {
      replacements: [parseInt(limit)],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error in getOutOfStockProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm hết hàng',
      error: error.message
    });
  }
};

// Get discounted products
exports.getDiscountedProducts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const query = `
      SELECT 
        p.*,
        sc.tenDanhMucChiTiet,
        c.tenDanhMuc,
        ROUND(((p.gia - p.giaKhuyenMai) / p.gia) * 100, 0) as discountPercent
      FROM sanpham p
      LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
      LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
      WHERE p.giaKhuyenMai IS NOT NULL 
        AND p.giaKhuyenMai > 0 
        AND p.giaKhuyenMai < p.gia
        AND p.trangThai = 'active'
      ORDER BY discountPercent DESC
      LIMIT ?
    `;

    const products = await sequelize.query(query, {
      replacements: [parseInt(limit)],
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error in getDiscountedProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm giảm giá',
      error: error.message
    });
  }
};

// Product performance analytics
exports.getProductPerformance = async (req, res) => {
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
      case '90d':
        dateCondition = 'AND o.ngayDatHang >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)';
        break;
      default:
        dateCondition = '';
    }

    const query = `
      SELECT 
        p.id_SanPham,
        p.tenSp,
        p.gia,
        p.giaKhuyenMai,
        p.soLuongTon,
        COALESCE(SUM(od.soLuongMua), 0) as totalSold,
        COALESCE(SUM(od.thanhTien), 0) as totalRevenue,
        COUNT(DISTINCT od.id_DonHang) as orderCount,
        COALESCE(AVG(od.giaTaiThoiDiem), 0) as avgSellPrice
      FROM sanpham p
      LEFT JOIN chitietdonhang od ON p.id_SanPham = od.id_SanPham
      LEFT JOIN donhang o ON od.id_DonHang = o.id_DonHang AND o.trangThaiDonHang = 'DA_GIAO' ${dateCondition}
      GROUP BY p.id_SanPham
      ORDER BY totalSold DESC, totalRevenue DESC
      LIMIT 20
    `;

    const performance = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: performance,
      period
    });
  } catch (error) {
    console.error('Error in getProductPerformance:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy hiệu suất sản phẩm',
      error: error.message
    });
  }
};

// Inventory analytics
exports.getInventoryAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as totalProducts,
        SUM(p.soLuongTon * p.gia) as totalInventoryValue,
        COUNT(CASE WHEN p.soLuongTon = 0 THEN 1 END) as outOfStock,
        COUNT(CASE WHEN p.soLuongTon <= p.soLuongToiThieu THEN 1 END) as lowStock,
        AVG(p.soLuongTon) as avgStock,
        SUM(p.soLuongTon) as totalStock
      FROM sanpham p
      WHERE p.trangThai = 'active'
    `;

    const [analytics] = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        totalProducts: parseInt(analytics.totalProducts),
        totalInventoryValue: parseFloat(analytics.totalInventoryValue),
        outOfStock: parseInt(analytics.outOfStock),
        lowStock: parseInt(analytics.lowStock),
        avgStock: parseFloat(analytics.avgStock),
        totalStock: parseInt(analytics.totalStock)
      }
    });
  } catch (error) {
    console.error('Error in getInventoryAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy phân tích kho',
      error: error.message
    });
  }
};

// Import from Excel (placeholder)
exports.importFromExcel = async (req, res) => {
  try {
    // TODO: Implement Excel import functionality
    res.json({
      success: false,
      message: 'Chức năng import Excel đang được phát triển'
    });
  } catch (error) {
    console.error('Error in importFromExcel:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi import Excel',
      error: error.message
    });
  }
};

// Export to Excel (placeholder)
exports.exportToExcel = async (req, res) => {
  try {
    // TODO: Implement Excel export functionality
    res.json({
      success: false,
      message: 'Chức năng export Excel đang được phát triển'
    });
  } catch (error) {
    console.error('Error in exportToExcel:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export Excel',
      error: error.message
    });
  }
};

// Download template (placeholder)
exports.downloadTemplate = async (req, res) => {
  try {
    // TODO: Implement template download functionality
    res.json({
      success: false,
      message: 'Chức năng tải template đang được phát triển'
    });
  } catch (error) {
    console.error('Error in downloadTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải template',
      error: error.message
    });
  }
}; 