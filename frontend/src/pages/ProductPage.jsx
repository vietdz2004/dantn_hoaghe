import React, { useEffect, useState } from 'react';
import ProductList from '../components/ProductList';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ProductPage: Trang danh sách sản phẩm
const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = '/products';
        
        // Lấy query parameters từ URL
        const cat = searchParams.get('cat');
        const subcat = searchParams.get('subcat');
        
        // Xây dựng URL với query parameters
        if (subcat) {
          url += `?subcat=${subcat}`;
        } else if (cat) {
          url += `?cat=${cat}`;
        }
        
        const res = await api.get(url);
        setProducts(res.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải sản phẩm');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]); // Re-run khi searchParams thay đổi

  const handleViewDetail = (product) => {
    navigate(`/products/${product.id_SanPham}`);
  };

  return (
    <div>
      <h2>Danh sách sản phẩm</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!loading && !error && (
        <ProductList products={products} onViewDetail={handleViewDetail} />
      )}
    </div>
  );
};

export default ProductPage; 