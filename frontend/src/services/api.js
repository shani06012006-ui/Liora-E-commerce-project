import axios from "axios";

const BASE_URL = "http://localhost:8000/api/";

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
  Promise.reject
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        window.location.href = "/Login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${BASE_URL}token/refresh/`,
          { refresh: refreshToken }
        );

        localStorage.setItem("access_token", data.access);

        originalRequest.headers.Authorization =
          `Bearer ${data.access}`;

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

// Generic API Helpers
const get = (url, params) => API.get(url, { params });
const post = (url, data) => API.post(url, data);
const put = (url, data, config = {}) => API.put(url, data, config);
const del = (url) => API.delete(url);

// AUTH APIs
export const authAPI = {
  register: (data) => post("/register/", data),
  login: (data) => post("/Login/", data),
  getProfile: () => get("/profile/"),
  updateProfile: (data) => put("/profile/", data),
  updateProfilePicture: (formData) =>
    put("/profile/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// PRODUCT APIs
export const productAPI = {
  getAll: (params) => get("/products/", params),
  getById: (id) => get(`/products/${id}/`),
  getByCategory: (category) =>
    get("/products/", { category }),
  search: (search) =>
    get("/products/", { search }),
};

// CART APIs
export const cartAPI = {
  getCart: () => get("/cart/"),
  addToCart: (data) => post("/cart/", data),
  updateQuantity: (id, quantity) =>
    put(`/cart/${id}/`, { quantity }),
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
  addToWishlist: (productId) =>
    post("/wishlist/", {
      product_id: productId,
    }),
  removeFromWishlist: (id) =>
    del(`/wishlist/${id}/`),
};

// REVIEW APIs
export const reviewAPI = {
  getReviews: (productId) =>
    get(`/reviews/${productId}/`),
  createReview: (productId, data) =>
    post(`/reviews/${productId}/`, data),
  getUserReviews: () =>
    get("/reviews/user_reviews/"),
};




export default API;