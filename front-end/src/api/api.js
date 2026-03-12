import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000//api/",
  withCredentials: true,
  timeout: 15000,   // 15 s — prevents requests hanging forever
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network failure or timeout — no response object at all
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        toast.error("Request timed out — server may be waking up, please retry")
      }
      // Don't show a toast here; callers handle it so messages stay contextual
      return Promise.reject(error)
    }

    const originalRequest = error.config
    const isRefreshRequest = originalRequest.url?.includes("refresh/")
    const isLogoutRequest  = originalRequest.url?.includes("logout/")

    // Blocked user
    if (error.response?.status === 403 &&
        error.response?.data?.error === "Access blocked. Contact admin.") {
      toast.error("Your account has been blocked. Contact admin.")
      if (!isLogoutRequest) {
        try { await api.post("logout/") } catch {}
      }
      window.location.replace("/login")
      return Promise.reject(error)
    }

    // Token expired — try refresh once
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !isRefreshRequest &&
        !isLogoutRequest) {
      originalRequest._retry = true
      try {
        await api.post("refresh/")
        return api(originalRequest)
      } catch {
        // Refresh failed — silent logout, let the page's own 401 handler redirect
        try { await api.post("logout/") } catch {}
      }
    }

    return Promise.reject(error)
  }
)

export default api

export const reserveProduct = (id) => api.post(`products/reserve/${id}/`)
export const toggleWishlist  = (id) => api.post(`products/wishlist/toggle/${id}/`)