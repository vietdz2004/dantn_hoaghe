import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  CheckCircle,
  Home,
  ShoppingBag,
  Phone,
  Email,
  LocationOn,
  Schedule
} from '@mui/icons-material';
import styles from './OrderSuccessPage.module.scss';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;
  const message = location.state?.message;

  useEffect(() => {
    // Redirect to home if no order data
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  const formatPrice = (price) => {
    if (!price || price === 0) return '0đ';
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  const getImageUrl = (hinhAnh) => {
    if (!hinhAnh) return '/no-image.png';
    if (hinhAnh.startsWith('http')) return hinhAnh;
    if (hinhAnh.startsWith('/')) return `http://localhost:5002${hinhAnh}`;
    return `http://localhost:5002/images/products/${hinhAnh}`;
  };

  if (!orderData) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box className={styles.successPage}>
      <Paper elevation={3} className={styles.successPaper}>
        {/* Success Header */}
        <Box className={styles.successHeader}>
          <CheckCircle className={styles.successIcon} />
          <Typography variant="h4" className={styles.successTitle}>
            Đặt hàng thành công!
          </Typography>
          <Typography variant="body1" className={styles.successMessage}>
            {message || 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.'}
          </Typography>
        </Box>

        <Divider className={styles.divider} />

        <Grid container spacing={4}>
          {/* Order Information */}
          <Grid item xs={12} md={6}>
            <Card className={styles.infoCard}>
              <CardContent>
                <Typography variant="h6" className={styles.cardTitle}>
                  📋 Thông tin đơn hàng
                </Typography>
                
                <Box className={styles.infoItem}>
                  <Typography variant="body2" color="text.secondary">
                    Mã đơn hàng:
                  </Typography>
                  <Typography variant="body1" className={styles.orderCode}>
                    #{Date.now().toString().slice(-8)}
                  </Typography>
                </Box>

                <Box className={styles.infoItem}>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiền:
                  </Typography>
                  <Typography variant="h6" className={styles.totalAmount}>
                    {formatPrice(orderData.tongThanhToan)}
                  </Typography>
                </Box>

                <Box className={styles.infoItem}>
                  <Typography variant="body2" color="text.secondary">
                    Phương thức thanh toán:
                  </Typography>
                  <Typography variant="body1">
                    {orderData.phuongThucThanhToan === 'cod' ? '💵 Thanh toán khi nhận hàng' :
                     orderData.phuongThucThanhToan === 'transfer' ? '🏦 Chuyển khoản ngân hàng' : 
                     '💳 Thanh toán online'}
                  </Typography>
                </Box>

                <Box className={styles.infoItem}>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian đặt:
                  </Typography>
                  <Typography variant="body1">
                    {new Date().toLocaleString('vi-VN')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className={styles.infoCard}>
              <CardContent>
                <Typography variant="h6" className={styles.cardTitle}>
                  👤 Thông tin khách hàng
                </Typography>
                
                <Box className={styles.contactInfo}>
                  <Box className={styles.contactItem}>
                    <Typography variant="body1" className={styles.contactLabel}>
                      Họ tên:
                    </Typography>
                    <Typography variant="body1">{orderData.hoTen}</Typography>
                  </Box>
                  
                  <Box className={styles.contactItem}>
                    <Phone className={styles.contactIcon} />
                    <Typography variant="body1">{orderData.soDienThoai}</Typography>
                  </Box>
                  
                  <Box className={styles.contactItem}>
                    <Email className={styles.contactIcon} />
                    <Typography variant="body1">{orderData.email}</Typography>
                  </Box>
                  
                  <Box className={styles.contactItem}>
                    <LocationOn className={styles.contactIcon} />
                    <Typography variant="body1">{orderData.diaChiGiao}</Typography>
                  </Box>
                  
                  {orderData.thoiGianGiao === 'schedule' && (
                    <Box className={styles.contactItem}>
                      <Schedule className={styles.contactIcon} />
                      <Typography variant="body1">
                        Giao hàng: {orderData.ngayGiao} {orderData.gioGiao}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Products List */}
          <Grid item xs={12} md={6}>
            <Card className={styles.infoCard}>
              <CardContent>
                <Typography variant="h6" className={styles.cardTitle}>
                  🛍️ Sản phẩm đã đặt
                </Typography>
                
                <List className={styles.productsList}>
                  {orderData.sanPham.map((item, index) => (
                    <ListItem key={index} className={styles.productItem}>
                      <ListItemAvatar>
                        <Avatar
                          src={getImageUrl(item.hinhAnh)}
                          alt={item.tenSp}
                          className={styles.productAvatar}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.tenSp}
                        secondary={`Số lượng: ${item.soLuong} x ${formatPrice(item.gia)}`}
                        className={styles.productText}
                      />
                      <Typography variant="body1" className={styles.productTotal}>
                        {formatPrice(item.thanhTien)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>

                <Divider className={styles.productsDivider} />

                {/* Order Summary */}
                <Box className={styles.orderSummary}>
                  <Box className={styles.summaryRow}>
                    <Typography variant="body2">Tạm tính:</Typography>
                    <Typography variant="body2">{formatPrice(orderData.tongTienHang)}</Typography>
                  </Box>
                  <Box className={styles.summaryRow}>
                    <Typography variant="body2">Phí giao hàng:</Typography>
                    <Typography variant="body2">
                      {orderData.phiVanChuyen === 0 ? 'Miễn phí' : formatPrice(orderData.phiVanChuyen)}
                    </Typography>
                  </Box>
                  {orderData.giaTriGiam > 0 && (
                    <Box className={styles.summaryRow}>
                      <Typography variant="body2" color="success.main">Giảm giá:</Typography>
                      <Typography variant="body2" color="success.main">
                        -{formatPrice(orderData.giaTriGiam)}
                      </Typography>
                    </Box>
                  )}
                  <Divider className={styles.totalDivider} />
                  <Box className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <Typography variant="h6">Tổng cộng:</Typography>
                    <Typography variant="h6" className={styles.finalTotal}>
                      {formatPrice(orderData.tongThanhToan)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Next Steps */}
        <Box className={styles.nextSteps}>
          <Typography variant="h6" className={styles.nextStepsTitle}>
            📞 Bước tiếp theo
          </Typography>
          <Typography variant="body1" className={styles.nextStepsText}>
            • Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng 15-30 phút<br/>
            • Hoa sẽ được chuẩn bị và giao đến địa chỉ của bạn<br/>
            • Bạn có thể theo dõi tình trạng đơn hàng trong mục "Đơn hàng của tôi"
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box className={styles.actionButtons}>
          <Button
            variant="outlined"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/orders')}
            className={styles.ordersBtn}
          >
            Xem đơn hàng
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            className={styles.homeBtn}
          >
            Về trang chủ
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderSuccessPage; 