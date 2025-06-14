import axios from 'axios';

// api: Cấu hình axios để gọi API backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Đổi lại khi deploy
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 