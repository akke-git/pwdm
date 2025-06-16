import axios from 'axios';

// 현재 환경에 따라 baseURL 설정
// 개발 환경에서는 http://localhost:3000/api 사용
// 프로덕션(도커) 환경에서는 /api 사용
// Vite에서는 process.env 대신 import.meta.env 사용
const isDevelopment = import.meta.env.DEV; // DEV는 개발 환경에서 true

const api = axios.create({
  baseURL: isDevelopment ? 'http://localhost:3000/api' : '/api',
  withCredentials: true,
});

// 요청 인터셉터로 JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
