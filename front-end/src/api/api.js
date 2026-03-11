import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "https://zoyr-ecommerce.onrender.com/api/",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshRequest = originalRequest.url?.includes("refresh/");
    const isLogoutRequest = originalRequest.url?.includes("logout/");

    // blocked user
    if (error.response?.data?.detail === "Your account has been blocked") {
      toast.error("Access blocked. Please contact admin.");

      if (!isLogoutRequest) {
        try {
          await api.post("logout/");
        } catch {}
      }

      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !isLogoutRequest
    ) {
      originalRequest._retry = true;

      try {
        await api.post("refresh/");
        return api(originalRequest);
      } catch {
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