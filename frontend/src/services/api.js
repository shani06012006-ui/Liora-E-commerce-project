import axios from 'axios';

const API = axios.create({ 
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors and token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('http://localhost:8000/api/token/refresh/', {
            refresh: refreshToken
          });
          
          if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return API(originalRequest);
          }
        } catch (refreshError) {
          console.error('Refresh failed:', refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

//AUTH APIS
export const authAPI = {
  register: (data) => API.post('/register/', data),
  login: (data) => API.post('/login/', data),
  getProfile: () => API.get('/profile/'),
  updateProfile: (data) => API.put('/profile/', data),
  updateProfilePicture: (formData) => API.put('/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

//PRODUCT APIS
export const productAPI = {
  getAll: (params) => API.get('/products/', { params }),
  getById: (id) => API.get(`/products/${id}/`),
  getByCategory: (category) => API.get(`/products/?category=${category}`),
  search: (query) => API.get(`/products/?search=${query}`),
};

//CART APIS
export const cartAPI = {
  getCart: () => API.get('/cart/'),
  addToCart: (data) => API.post('/cart/', data),
  updateQuantity: (itemId, quantity) => API.put(`/cart/${itemId}/`, { quantity }),
  removeItem: (itemId) => API.delete(`/cart/${itemId}/`),
};

// ORDER APIS 
export const orderAPI = {
  checkout: (data) => API.post('/checkout/', data),
  getOrders: () => API.get('/orders/'),
  getOrderById: (id) => API.get(`/orders/${id}/`),
};

//WISHLIST APIS
export const wishlistAPI = {
  getWishlist: () => API.get('/wishlist/'),
  addToWishlist: (productId) => API.post('/wishlist/', { product_id: productId }),
  removeFromWishlist: (id) => API.delete(`/wishlist/${id}/`),
};

//REVIEW APIS
export const reviewAPI = {
  getReviews: (productId) => API.get(`/reviews/${productId}/`),
  createReview: (productId, data) => API.post(`/reviews/${productId}/`, data),
  getUserReviews: () => API.get('/reviews/user_reviews/'),
};

//COUPON APIS
export const couponAPI = {
  applyCoupon: (code, total) => API.post('/coupons/apply/', { code, total }),
  getCoupons: () => API.get('/coupons/'),
};

export default API;