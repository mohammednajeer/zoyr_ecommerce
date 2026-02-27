import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
});


api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Don't retry if it's already the refresh request, or already retried
    const isRefreshRequest = originalRequest.url?.includes("refresh/");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      try {
        await api.post("refresh/");
        return api(originalRequest);
      } catch (err) {
       
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