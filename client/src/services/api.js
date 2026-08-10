import axios from 'axios';
import toast from 'react-hot-toast';

export const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:') || filePath.startsWith('data:')) {
    return filePath;
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  let backendOrigin = '';
  if (envUrl) {
    backendOrigin = envUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '');
  } else if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    backendOrigin = 'https://meeting-management-backend-28xq.onrender.com';
  }

  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return backendOrigin ? `${backendOrigin}${cleanPath}` : cleanPath;
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
