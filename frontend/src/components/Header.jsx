import React, { useState, useRef } from 'react';
import { Box, Typography, IconButton, InputBase, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import styles from './Header.module.css';
import CategoryMenu from './CategoryMenu';

const Header = () => {
  const [openAccount, setOpenAccount] = useState(false);
  const accountRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  React.useEffect(() => {
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setOpenAccount(false);
      }
    };
    if (openAccount) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openAccount]);

  return (
    <header className={styles.headerWrap}>
      {/* Dòng trên cùng: hotline + tài khoản/giỏ hàng/thanh toán */}
      <Box className={styles.topBar}>
        <Typography className={styles.hotline} align="center">
          HOTLINE: 1900 633 045 | 0865 160 360
        </Typography>
        <Box className={styles.accountBarTop}>
          <Box ref={accountRef} style={{ position: 'relative' }}>
            <IconButton size="small" className={styles.accountBtnTop} onClick={() => setOpenAccount(v => !v)}>
              <AccountCircleIcon fontSize="small" />
              <span className={styles.accountTextTop}>Tài khoản</span>
            </IconButton>
            {openAccount && (
              <Box style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                minWidth: 200,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                padding: '18px 24px',
                zIndex: 9999,
                border: '1px solid #eee',
              }}>
                <Box style={{ padding: '6px 0', cursor: 'pointer', fontSize: 17, color: '#222', borderBottom: '1px solid #f0f0f0' }} onClick={() => window.location.href='/register'}>Đăng ký</Box>
                <Box style={{ padding: '6px 0', cursor: 'pointer', fontSize: 17, color: '#222' }} onClick={() => window.location.href='/login'}>Đăng nhập</Box>
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
      </Box>
      {/* Dòng giữa: social - logo - search/cart */}
      <Box className={styles.midBar}>
        <Box className={styles.socialsMid}>
          <a href="#" target="_blank" rel="noopener" aria-label="Facebook">
            <img src="/facebook.svg" alt="fb" className={styles.socialIcon} />
          </a>
          <a href="#" target="_blank" rel="noopener" aria-label="Twitter">
            <img src="/twitter.svg" alt="tw" className={styles.socialIcon} />
          </a>
          <a href="#" target="_blank" rel="noopener" aria-label="Instagram">
            <img src="/instagram.svg" alt="ig" className={styles.socialIcon} />
          </a>
        </Box>
        <Box className={styles.logoWrapMid}>
          <img src="/logo-hoashop.png" alt="Hoashop" className={styles.logoImg} />
          <Typography className={styles.logoText}>
            
            <span className={styles.logoSlogan}></span>
          </Typography>
        </Box>
        <Box className={styles.rightBar}>
          <Box className={styles.searchCartWrap}>
            <Box className={styles.searchWrap}>
              <InputBase className={styles.searchInput} placeholder="Tìm kiếm"  />
              <IconButton className={styles.searchBtn}><SearchIcon /></IconButton>
            </Box>
            <IconButton size="large" className={styles.cartBtn}>
              <Badge badgeContent={0} color="secondary">
                <ShoppingBagIcon fontSize="large" />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Box>
      {/* Dòng dưới: menu ngang động */}
      <CategoryMenu />
    </header>
  );
};

export default Header;