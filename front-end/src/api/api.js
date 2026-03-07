import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {

    const originalRequest = error.config;

    // 🚫 BLOCKED USER
    if (error.response?.data?.detail === "Your account has been blocked") {

      toast.error("Access blocked. Please contact admin.");

      try {
        await api.post("logout/"); // clear cookies
      } catch {}

      return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest.url?.includes("refresh/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        await api.post("refresh/");
        return api(originalRequest);
      } catch (err) {
        // refresh failed → logout
        try {
          await api.post("logout/");
        } catch {}
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