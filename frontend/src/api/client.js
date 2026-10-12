import axios from 'axios';

const api = axios.create({
  baseURL: (typeof window !== 'undefined' && window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('estateflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction and 401 handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If unauthorized, clear session and redirect to login if not already there
    if (error.response?.status === 401) {
      localStorage.removeItem('estateflow_token');
      localStorage.removeItem('estateflow_user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    let message = 'An unexpected error occurred';
    if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
