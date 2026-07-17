// frontend/src/services/api.js
import axios from "axios";
import { getTokens, clearSession, setTokens } from '../utils/storage';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || "/api/";
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL || "http://localhost:8000";

export const getImageUrl = (product) => {
  if (!product) return 'https://placehold.co/100x100/e0e0e0/2D2D2D?text=No+Image';
  if (product?.image_url) return product.image_url;
  if (product?.image) {
    if (product.image.startsWith('http') || product.image.startsWith('/')) {
      return product.image;
    }
    return `${MEDIA_BASE_URL}${product.image}`;
  }
  return 'https://placehold.co/100x100/e0e0e0/2D2D2D?text=No+Image';
};

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Use sessionStorage
API.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      const data = error.response?.data;
      
      if (data && data.blocked === true) {
        toast.error(data.error || 'Your account has been blocked by the administrator. Please contact support.');
        clearSession();
        window.location.href = '/Login?blocked=true';
        return Promise.reject(error);
      }
      
      const detail = error.response?.data?.detail || "";
      if (detail.toLowerCase().includes("blocked")) {
        clearSession();
        window.location.href = "/Login?blocked=true";
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken } = getTokens();

      if (!refreshToken) {
        clearSession();
        window.location.href = "/Login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        setTokens(data.access, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return API(originalRequest);
      } catch {
        clearSession();
        window.location.href = "/Login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

const get = (url, params) => API.get(url, { params });
const post = (url, data) => API.post(url, data);
const put = (url, data, config = {}) => API.put(url, data, config);
const patch = (url, data) => API.patch(url, data);
const del = (url) => API.delete(url);

// ✅ AUTH APIs - All use the same API instance
export const authAPI = {
  register: (data) => post("/register/", data),
  login: (data) => post("/Login/", data),
  googleLogin: (data) => post("/auth/google/", data),
  verifyOtp: (data) => post("/verify-otp/", data),
  resendOtp: (data) => post("/resend-otp/", data),
  getProfile: () => get("/profile/"),
  updateProfile: (data) => put("/profile/", data),
  updateProfilePicture: (formData) =>
    put("/profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAddresses: () => get("/addresses/"),
  createAddress: (data) => post("/addresses/create/", data),
  updateAddress: (id, data) => put(`/addresses/${id}/`, data),
  deleteAddress: (id) => del(`/addresses/${id}/`),
  setDefaultAddress: (id) => post(`/addresses/${id}/set-default/`),
};

// ✅ PRODUCT APIs
export const productAPI = {
  getAll: (params) => get("/products/", params),
  getById: (id) => get(`/products/${id}/`),
  getByCategory: (category) => get("/products/", { category }),
  search: (search) => get("/products/", { search }),
};

// ✅ CART APIs
export const cartAPI = {
  getCart: () => get("/cart/"),
  addToCart: (data) => post("/cart/", data),
  updateQuantity: (id, quantity) => put(`/cart/${id}/`, { quantity }),
  removeItem: (id) => del(`/cart/${id}/`),
};

// ✅ ORDER APIs
export const orderAPI = {
  checkout: (data) => post("/checkout/", data),
  getOrders: () => get("/orders/"),
  getOrderById: (id) => get(`/orders/${id}/`),
  buyNow: (data) => post("/buy-now/", data),
};

// WISHLIST APIs
export const wishlistAPI = {
  getWishlist: () => get("/wishlist/"),
  addToWishlist: (productId) => post("/wishlist/", { product_id: productId }),
  removeFromWishlist: (id) => del(`/wishlist/${id}/`),
};

// REVIEW APIs
export const reviewAPI = {
  getReviews: (productId) => get(`/reviews/${productId}/`),
  createReview: (productId, data) => post(`/reviews/${productId}/`, data),
  getUserReviews: () => get("/reviews/user_reviews/"),
};

// ADMIN APIs
export const adminAPI = {
  getDashboardStats: (params) => get("/admin/dashboard/stats/", params),
  getProducts: () => get("/admin/products/"),
  createProduct: (data) => post("/admin/products/", data),
  updateProduct: (id, data) => patch(`/admin/products/${id}/`, data),
  deleteProduct: (id) => del(`/admin/products/${id}/`),
  getCategories: () => get("/admin/categories/"),
  createCategory: (data) => post("/admin/categories/", data),
  updateCategory: (id, data) => patch(`/admin/categories/${id}/`, data),
  deleteCategory: (id) => del(`/admin/categories/${id}/`),
  getOrders: (params) => get("/admin/orders/", params),
  updateOrderStatus: (id, status) => patch(`/admin/orders/${id}/`, { status }),
  deleteOrder: (id) => del(`/admin/orders/${id}/`),
  getUsers: () => get("/admin/users/"),
  toggleUserBlock: (id, isBlocked) =>
    patch(`/admin/users/${id}/`, { is_blocked: !isBlocked }),
  deleteUser: (id) => del(`/admin/users/${id}/`),
  getReviews: () => get("/admin/reviews/"),
  updateReview: (id, data) => patch(`/admin/reviews/${id}/`, data),
  deleteReview: (id) => del(`/admin/reviews/${id}/`),
  getAnalyticsSales: (params) => get("/admin/analytics/sales/", params),
  getAnalyticsRevenue: (params) => get("/admin/analytics/revenue/", params),
  getAnalyticsCustomers: (params) => get("/admin/analytics/customers/", params),
  getAnalyticsProducts: (params) => get("/admin/analytics/products/", params),
  getPaymentMethods: () => get("/admin/payments/methods/"),
  createPaymentMethod: (data) => post("/admin/payments/methods/", data),
  updatePaymentMethod: (id, data) => patch(`/admin/payments/methods/${id}/`, data),
  togglePaymentMethod: (id, data) => patch(`/admin/payments/methods/${id}/toggle/`, data),
  deletePaymentMethod: (id) => del(`/admin/payments/methods/${id}/`),
  getTransactions: (params) => get("/admin/payments/transactions/", params),
  getRefunds: (params) => get("/admin/payments/refunds/", params),
};

export default API;