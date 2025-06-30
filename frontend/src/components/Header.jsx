import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, InputBase, Badge, Container } from '@mui/material';
import { Search as SearchIcon, ShoppingCart as CartIcon } from '@mui/icons-material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonOutline from '@mui/icons-material/PersonOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CategoryMenu from './CategoryMenu';
import styles from './Header.module.scss';

const Header = () => {
  const [openAccount, setOpenAccount] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setOpenAccount(false);
      }
    };
    if (openAccount) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openAccount]);

  // Scroll detection để ẩn/hiện header sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100); // Ẩn khi scroll xuống > 100px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleAccountItemClick = (path) => {
    navigate(path);
    setOpenAccount(false);
  };

  const handleLogout = async () => {
    await logout();
    setOpenAccount(false);
    navigate('/');
  };

  return (
    
    <Box className={`${styles.headerWrap} ${isScrolled ? styles.scrolled : ''}`}>
      {/* TOP BAR - Dòng 1 */}
      <Box className={`${styles.topBar} ${isScrolled ? styles.hidden : ''}`}>
        <Container className={styles.container}>
          <Typography className={styles.hotline}>
            HOTLINE: 1900 633 045 | 0865 160 360
          </Typography>
          <Box className={styles.accountBarTop}>
            <Box ref={accountRef} className={styles.accountWrapper}>
              <Box 
                className={styles.accountBtnTop} 
                onClick={() => setOpenAccount(v => !v)}
              >
                <PersonOutline fontSize="small" />
                <span className={styles.accountTextTop}>
                  {isAuthenticated ? `Chào ${user?.hoTen || user?.ten || 'Bạn'}` : 'Tài khoản'}
                </span>
              </Box>
              <Box className={`${styles.accountDropdown} ${openAccount ? styles.open : ''}`}>
                {isAuthenticated ? (
                  // Đã đăng nhập - hiển thị thông tin user và đăng xuất
                  <>
                    <Box 
                      className={styles.dropdownItem} 
                      onClick={() => handleAccountItemClick('/profile')}
                    >
                      👤 Thông tin cá nhân
                    </Box>
                    <Box 
                      className={styles.dropdownItem} 
                      onClick={() => handleAccountItemClick('/orders')}
                    >
                      📦 Đơn hàng của tôi
                    </Box>
                    <Box 
                      className={styles.dropdownItem} 
                      onClick={handleLogout}
                    >
                      🚪 Đăng xuất
                    </Box>
                  </>
                ) : (
                  // Chưa đăng nhập - hiển thị đăng ký và đăng nhập
                  <>
                    <Box 
                      className={styles.dropdownItem} 
                      onClick={() => handleAccountItemClick('/register')}
                    >
                      📝 Đăng ký
                    </Box>
                    <Box 
                      className={styles.dropdownItem} 
                      onClick={() => handleAccountItemClick('/login')}
                    >
                      🔑 Đăng nhập
                    </Box>
                  </>
                )}
              </Box>
            </Box>
            
            <Box className={styles.cartBtnTop} onClick={handleCartClick}>
              <ShoppingBagIcon fontSize="small" />
              <span className={styles.accountTextTop}>Giỏ hàng</span>
            </Box>
            
            <Box className={styles.paymentBtnTop} onClick={() => navigate('/orders')}>
              <PaymentIcon fontSize="small" />
              <span className={styles.accountTextTop}>Thanh toán</span>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* MAIN BAR - Dòng 2 */}
      <Box className={`${styles.midBar} ${isScrolled ? styles.hidden : ''}`}>
        <Container className={styles.container} style={{ position: 'relative' }}>
          {/* Social Icons - Left */}
          <Box className={styles.socialsMid}>
            <IconButton 
              href="https://facebook.com" 
              target="_blank" 
              size="small"
              className={styles.socialIcon}
            >
              <Facebook fontSize="small" />
            </IconButton>
            <IconButton 
              href="https://twitter.com" 
              target="_blank" 
              size="small"
              className={styles.socialIcon}
            >
              <Twitter fontSize="small" />
            </IconButton>
            <IconButton 
              href="https://instagram.com" 
              target="_blank" 
              size="small"
              className={styles.socialIcon}
            >
              <Instagram fontSize="small" />
            </IconButton>
          </Box>

          {/* Logo - Center */}
          <Box className={styles.logoWrapMid}>
            <Link to="/" className={styles.logoLink}>
              <img 
                src="/images/logo.png" 
                alt="FlowerCorner"
                className={styles.logoImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <Box style={{ display: 'none' }}>
                <Typography className={styles.logoText}>
                  🌸 FLOWERCORNER
                </Typography>
                <Typography className={styles.logoSlogan}>
                  Say it with flowers
                </Typography>
              </Box>
            </Link>
          </Box>

          {/* Search + Cart - Right */}
          <Box className={styles.rightBar}>
            <Box className={styles.searchCartWrap}>
              {/* Search */}
              <Box className={styles.searchWrap}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <InputBase
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  <IconButton type="submit" size="small" className={styles.searchBtn}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </form>
              </Box>

              {/* Cart */}
              <IconButton 
                className={styles.cartBtn} 
                onClick={handleCartClick}
              >
                <Badge badgeContent={totalItems} color="error">
                  <CartIcon />
                </Badge>
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CATEGORY MENU - Dòng 3 */}
      <Box className={`${styles.categoryMenuWrap} ${isScrolled ? styles.stickyMenu : ''}`}>
        <CategoryMenu isScrolled={isScrolled} />
      </Box>

      {/* PROMO BAR - Dòng 4 */}
      <Box className={`${styles.promoBar} ${isScrolled ? styles.hidden : ''}`}>
        <Container className={styles.container}>
          <Typography className={styles.promoText}>
            ĐẶT HOA ONLINE - GIAO MIỄN PHÍ TP HCM & HÀ NỘI - GỌI NGAY 1900 633 045 HOẶC 0865 160 360
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Header;