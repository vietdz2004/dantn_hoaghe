const { Category, SubCategory } = require('../models');
const sequelize = require('../models/database');

// Lấy tất cả danh mục với số lượng sản phẩm
exports.getAll = async (req, res) => {
  try {
    console.log('🔍 Getting all categories...');
    
    // Lấy categories với subcategories đã có products
    const categories = await Category.findAll({
      include: [{
        model: SubCategory,
        required: false
      }]
    });

    console.log(`📊 Found ${categories.length} categories from database`);

    // Filter và count products cho mỗi category/subcategory
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const categoryData = category.toJSON();
        
        // ✅ FIXED: Đổi từ p.trangthai = 1 thành p.trangThai = 'active'
        const productCountQuery = `
          SELECT COUNT(*) as count 
          FROM sanpham p 
          JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet 
          WHERE sc.id_DanhMuc = ? AND p.trangThai = 'active'
        `;
        
        const [productCount] = await category.sequelize.query(productCountQuery, {
          replacements: [category.id_DanhMuc],
          type: category.sequelize.QueryTypes.SELECT
        });

        categoryData.totalProducts = parseInt(productCount.count) || 0;
        console.log(`📈 Category "${categoryData.tenDanhMuc}": ${categoryData.totalProducts} products`);
        
        // Filter subcategories that have products
        if (categoryData.SubCategories) {
          const subcategoriesWithProducts = await Promise.all(
            categoryData.SubCategories.map(async (subcat) => {
              // ✅ FIXED: Đổi từ p.trangthai = 1 thành p.trangThai = 'active'
              const subProductCountQuery = `
                SELECT COUNT(*) as count 
                FROM sanpham p 
                WHERE p.id_DanhMucChiTiet = ? AND p.trangThai = 'active'
              `;
              
              const [subProductCount] = await category.sequelize.query(subProductCountQuery, {
                replacements: [subcat.id_DanhMucChiTiet],
                type: category.sequelize.QueryTypes.SELECT
              });

              subcat.product_count = parseInt(subProductCount.count) || 0;
              console.log(`  📦 Subcategory "${subcat.tenDanhMucChiTiet}": ${subcat.product_count} products`);
              return subcat;
            })
          );
          
          // ✅ TEMP: Không filter subcategories để debug - hiển thị tất cả
          categoryData.SubCategories = subcategoriesWithProducts;
        }

        return categoryData;
      })
    );

    // ✅ TEMP: Không filter categories để debug - hiển thị tất cả
    const resultCategories = categoriesWithProducts;
    console.log(`✅ Returning ${resultCategories.length} categories`);

    res.json({
      success: true,
      data: resultCategories,
      message: `Lấy danh sách ${resultCategories.length} danh mục thành công`
    });
  } catch (error) {
    console.error('❌ Error in getAll categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy danh mục theo id
exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [SubCategory]
    });
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới danh mục
exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật danh mục
exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    await category.update(req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa danh mục
exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    await category.destroy();
    res.json({ message: 'Đã xóa danh mục' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 