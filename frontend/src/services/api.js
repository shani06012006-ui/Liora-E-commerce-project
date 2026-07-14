import axios from "axios";

const BASE_URL = "/api/";
const MEDIA_BASE_URL = "http://localhost:8000";
export const getImageUrl = (product) => {
  if (product?.image_url) return product.image_url;
  if (product?.image) return `${MEDIA_BASE_URL}${product.image}`;
  return 'https://placehold.co/100x100/e0e0e0/2D2D2D?text=No+Image';
};

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
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
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      const detail = error.response?.data?.detail || "";
      if (detail.toLowerCase().includes("blocked")) {
        ["access_token", "refresh_token", "user"].forEach((key) =>
          localStorage.removeItem(key)
        );
        window.location.href = "/login?blocked=true";   // ← lowercase
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem("access_token", data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return API(originalRequest);
      } catch {
        ["access_token", "refresh_token", "user"].forEach((key) =>
          localStorage.removeItem(key)
        );
        window.location.href = "/Login";
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

// AUTH APIs
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
};

// PRODUCT APIs
export const productAPI = {
  getAll: (params) => get("/products/", params),
  getById: (id) => get(`/products/${id}/`),
  getByCategory: (category) => get("/products/", { category }),
  search: (search) => get("/products/", { search }),
};

// CART APIs
export const cartAPI = {
  getCart: () => get("/cart/"),
  addToCart: (data) => post("/cart/", data),
  updateQuantity: (id, quantity) => put(`/cart/${id}/`, { quantity }),
  removeItem: (id) => del(`/cart/${id}/`),
};

// ORDER APIs
export const orderAPI = {
  checkout: (data) => post("/checkout/", data),
  getOrders: () => get("/orders/"),
  getOrderById: (id) => get(`/orders/${id}/`),
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

// ADMIN APIs — new, centralizes every admin page's fetch logic
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => get("/admin/dashboard/stats/"),

  // Products
  getProducts: () => get("/admin/products/"),
  createProduct: (data) => post("/admin/products/", data),
  updateProduct: (id, data) => patch(`/admin/products/${id}/`, data),
  deleteProduct: (id) => del(`/admin/products/${id}/`),

  // Categories
  getCategories: () => get("/admin/categories/"),
  createCategory: (data) => post("/admin/categories/", data),
  updateCategory: (id, data) => patch(`/admin/categories/${id}/`, data),
  deleteCategory: (id) => del(`/admin/categories/${id}/`),

  // Orders
  getOrders: (params) => get("/admin/orders/", params),
  updateOrderStatus: (id, status) => patch(`/admin/orders/${id}/`, { status }),
  deleteOrder: (id) => del(`/admin/orders/${id}/`),

  // Users
  getUsers: () => get("/admin/users/"),
  toggleUserBlock: (id, isBlocked) =>
    patch(`/admin/users/${id}/`, { is_blocked: !isBlocked }),
  deleteUser: (id) => del(`/admin/users/${id}/`),

  // Reviews
  getReviews: () => get("/admin/reviews/"),
  deleteReview: (id) => del(`/admin/reviews/${id}/`),
};

export default API;