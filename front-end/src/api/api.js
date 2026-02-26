import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
});


// 🔥 AUTO REFRESH INTERCEPTOR
api.interceptors.response.use(
  response => response,

  async error => {

    const originalRequest = error.config;

    // If access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {

      originalRequest._retry = true;

      try {

        // Call refresh endpoint
        await api.post("refresh/");

        // Retry original request
        return api(originalRequest);

      } catch (err) {

        // Refresh failed → force logout
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;


// Keep your existing functions
export const reserveProduct = (id) => {
  return api.post(`products/reserve/${id}/`);
};

export const toggleWishlist = (id) => {
  return api.post(`products/wishlist/toggle/${id}/`);
};