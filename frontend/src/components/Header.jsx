import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, IconButton, InputBase, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonOutline from '@mui/icons-material/PersonOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import styles from './Header.module.scss';

const Header = ({ isScrolled }) => {
  const [openAccount, setOpenAccount] = useState(false);
  const accountRef = useRef(null);

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

  return (
    <header className={`${styles.headerWrap} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          {/* Hotline */}
          <Typography className={styles.hotline}>
            📞 HOTLINE: 1900 633 045 | 0865 160 360
          </Typography>
          
          {/* Account Actions */}
          <Box className={styles.accountBarTop}>
            <Box ref={accountRef} style={{ position: 'relative' }}>
              <IconButton 
                size="small" 
                className={styles.accountBtnTop} 
                onClick={() => setOpenAccount(v => !v)} 
                disableRipple
              >
                <PersonOutline fontSize="small" />
                <span className={styles.accountTextTop}>Tài khoản</span>
              </IconButton>
              {openAccount && (
                <Box className={styles.accountDropdown}>
                  <Box 
                    className={styles.dropdownItem} 
                    onClick={() => window.location.href='/register'}
                  >
                    📝 Đăng ký
                  </Box>
                  <Box 
                    className={styles.dropdownItem} 
                    onClick={() => window.location.href='/login'}
                  >
                    🔑 Đăng nhập
                  </Box>
                </Box>
              )}
            </Box>
            <IconButton size="small" className={styles.cartBtnTop}>
              <ShoppingBagIcon fontSize="small" />
              <span className={styles.accountTextTop}>Giỏ hàng</span>
            </IconButton>
            <IconButton size="small" className={styles.paymentBtnTop}>
              <PaymentIcon fontSize="small" />
              <span className={styles.accountTextTop}>Thanh toán</span>
            </IconButton>
          </Box>
        </div>
      </div>

      <div className={styles.midBar}>
        <div className={styles.container}>
          {/* Social Icons */}
          <Box className={styles.socialsMid}>
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
              <img src="/facebook.svg" alt="Facebook" className={styles.socialIcon} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">
              <img src="/twitter.svg" alt="Twitter" className={styles.socialIcon} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
              <img src="/instagram.svg" alt="Instagram" className={styles.socialIcon} />
            </a>
          </Box>
          
          {/* Logo */}
          <Box className={styles.logoWrapMid}>
            <Link to="/">
              <img src="/logo-hoashop.png" alt="Hoashop - Shop Hoa Tươi" className={styles.logoImg} />
            </Link>
          </Box>
          
          {/* Search & Cart */}
          <Box className={styles.rightBar}>
            <Box className={styles.searchCartWrap}>
              <Box className={styles.searchWrap}>
                <InputBase
                  className={styles.searchInput}
                  placeholder="Tìm kiếm hoa tươi..."
                  fullWidth
                />
                <IconButton className={styles.searchBtn} aria-label="Tìm kiếm">
                  <SearchIcon />
                </IconButton>
              </Box>
              <IconButton size="large" className={styles.cartBtn} aria-label="Giỏ hàng">
                <Badge badgeContent={0} color="error">
                  <ShoppingBagIcon fontSize="large" />
                </Badge>
              </IconButton>
            </Box>
          </Box>
        </div>
      </div>
    </header>
  );
};

export default Header;