import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { createQuickOrder } from '../services/quickOrderApi';
import styles from './QuickOrderModal.module.scss';

const QuickOrderModal = ({ open, onClose, product, quantity = 1 }) => {
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field) => (event) => {
    const value = field === 'agreeTerms' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.soDienThoai.trim())) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Vui lòng đồng ý điều khoản';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const orderData = {
        tenKhachHang: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        maSanPham: product?.id || product?.maSanPham,
        soLuong: quantity,
        ghiChu: `Đặt từ web - ${product?.tenSp}`
      };
      
      const result = await createQuickOrder(orderData);
      
      // Success - close modal and show success message
      onClose(true, result.message); // Pass success message
    } catch (error) {
      console.error('Error submitting quick order:', error);
      setErrors({ submit: error.message || 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      hoTen: '',
      soDienThoai: '',
      agreeTerms: false
    });
    setErrors({});
    onClose(false);
  };

  if (!product) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className={styles.quickOrderModal}
    >
      <DialogTitle className={styles.dialogTitle}>
        <Typography variant="h6" className={styles.title}>
          ĐẶT HOA NHANH
        </Typography>
        <Button
          onClick={handleClose}
          className={styles.closeBtn}
          size="small"
        >
          <Close />
        </Button>
      </DialogTitle>
      
      <DialogContent className={styles.dialogContent}>
        <Typography variant="body2" color="text.secondary" className={styles.description}>
          Quý khách vui lòng điền thông tin bên dưới và bấm nút đặt hàng, 
          nhân viên chúng tôi sẽ gọi quý khách trong ít phút để hỗ trợ đặt hàng:
        </Typography>

        <Box className={styles.productInfo}>
          <Typography variant="subtitle2">
            Sản phẩm: <strong>{product.tenSp}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Số lượng: {quantity} | Giá: {product.giaKhuyenMai ? 
              `${Number(product.giaKhuyenMai).toLocaleString('vi-VN')}VND` : 
              `${Number(product.gia).toLocaleString('vi-VN')}VND`
            }
          </Typography>
        </Box>

        <Box className={styles.formGroup}>
          <TextField
            label="Họ tên"
            fullWidth
            value={formData.hoTen}
            onChange={handleInputChange('hoTen')}
            error={!!errors.hoTen}
            helperText={errors.hoTen}
            className={styles.textField}
          />
        </Box>

        <Box className={styles.formGroup}>
          <TextField
            label="Số điện thoại"
            fullWidth
            value={formData.soDienThoai}
            onChange={handleInputChange('soDienThoai')}
            error={!!errors.soDienThoai}
            helperText={errors.soDienThoai}
            className={styles.textField}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.agreeTerms}
              onChange={handleInputChange('agreeTerms')}
              color="primary"
            />
          }
          label="Tôi không phải là người máy"
          className={styles.checkboxField}
        />
        {errors.agreeTerms && (
          <Typography color="error" variant="caption" className={styles.errorText}>
            {errors.agreeTerms}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" className={styles.timeInfo}>
          * Đặt hoa nhanh từ 7:00-20:00
        </Typography>

        {errors.submit && (
          <Alert severity="error" className={styles.submitError}>
            {errors.submit}
          </Alert>
        )}
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          className={styles.cancelBtn}
        >
          HỦY
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? 'ĐANG XỬ LÝ...' : 'GỬI ĐƠN HÀNG'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickOrderModal; 