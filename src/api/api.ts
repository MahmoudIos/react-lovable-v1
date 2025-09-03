import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : import.meta.env.VITE_API_BASE_URL || 'API',
});

// Request interceptor to automatically include Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    
    // Handle HTML error responses (security blocks)
    if (
      error?.response?.headers['content-type']?.includes('text/html') &&
      error.response.data?.toLowerCase()?.includes('support id')
    ) {
      const ticketNumber = error.response.data.replace(/\D+/g, '');
      alert(
        `The requested URL was rejected. Please consult with your administrator. Your support ID is: ${ticketNumber}`
      );
    }
    
    return Promise.reject(error);
  }
);

export default api;