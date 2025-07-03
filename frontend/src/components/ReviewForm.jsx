import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Star } from '@mui/icons-material';
import api from '../services/api';

// ReviewForm: Component form để viết đánh giá sản phẩm
const ReviewForm = ({ 
  open, 
  onClose, 
  productId, 
  productName,
  onReviewSubmitted,
  userHasPurchased = true 
}) => {
  // STATE MANAGEMENT - Quản lý trạng thái form
  const [formData, setFormData] = useState({
    rating: 5,
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // VALIDATION - Kiểm tra dữ liệu form
  const validateForm = () => {
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      setError('Vui lòng chọn số sao từ 1-5');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return false;
    }
    if (formData.content.trim().length < 10) {
      setError('Nội dung đánh giá phải có ít nhất 10 ký tự');
      return false;
    }
    return true;
  };

  // SUBMIT HANDLER - Xử lý gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    if (!userHasPurchased) {
      setError('Bạn cần mua sản phẩm này trước khi có thể đánh giá');
      return;
    }

    setLoading(true);
    
    try {
      // Gọi API tạo đánh giá mới
      const reviewData = {
        id_SanPham: productId,
        noiDung: formData.content.trim(),
        danhGiaSao: formData.rating,
        ngayDanhGia: new Date().toISOString()
      };

      console.log('📝 Gửi đánh giá:', reviewData);
      
      const response = await api.post('/reviews', reviewData);
      
      if (response.data.success || response.data.id_DanhGia) {
        setSuccess(true);
        
        // Reset form
        setFormData({ rating: 5, content: '' });
        
        // Thông báo parent component để refresh danh sách đánh giá
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
        
        // Tự động đóng form sau 2 giây
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
        
      } else {
        throw new Error(response.data.message || 'Có lỗi khi gửi đánh giá');
      }
      
    } catch (err) {
      console.error('❌ Lỗi gửi đánh giá:', err);
      setError(err.response?.data?.message || err.message || 'Có lỗi khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  // RESET FORM - Reset form khi đóng
  const handleClose = () => {
    if (!loading) {
      setFormData({ rating: 5, content: '' });
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  // INPUT HANDLERS - Xử lý thay đổi input
  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, rating: newValue }));
    setError(''); // Clear error khi user thay đổi
  };

  const handleContentChange = (event) => {
    setFormData(prev => ({ ...prev, content: event.target.value }));
    setError(''); // Clear error khi user thay đổi
  };

  // RENDER COMPONENT
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          ✍️ Viết đánh giá
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {productName}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* SUCCESS MESSAGE */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              🎉 Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được gửi thành công.
            </Alert>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* KHÔNG MUA SẢN PHẨM */}
          {!userHasPurchased && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⚠️ Bạn cần mua sản phẩm này trước khi có thể viết đánh giá
            </Alert>
          )}

          {/* RATING SELECTOR */}
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" gutterBottom>
              Đánh giá sản phẩm *
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating
                name="rating"
                value={formData.rating}
                onChange={handleRatingChange}
                size="large"
                icon={<Star fontSize="inherit" />}
                emptyIcon={<Star fontSize="inherit" />}
                disabled={loading || !userHasPurchased}
              />
              <Typography variant="body2" color="text.secondary">
                ({formData.rating} sao)
              </Typography>
            </Box>
          </Box>

          {/* CONTENT INPUT */}
          <TextField
            label="Nội dung đánh giá *"
            multiline
            rows={4}
            fullWidth
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            disabled={loading || !userHasPurchased}
            helperText={`${formData.content.length}/500 ký tự (tối thiểu 10 ký tự)`}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            color="inherit"
          >
            Hủy
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading || !userHasPurchased || !formData.content.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReviewForm; 