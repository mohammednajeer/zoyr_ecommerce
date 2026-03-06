import api from "../api/api";

export const getAdminDashboard = () => {
  return api.get("products/admin/dashboard/");
};

export const getAdminUsers = () => {
  return api.get("admin/users/");
};

export const getAdminOrders = () => {
  return api.get("products/admin/orders/");
};

export const deleteUser = (id) => {
  return api.delete(`admin/users/${id}/delete/`);
};

export const toggleUserStatus = (id) => {
  return api.patch(`admin/users/${id}/toggle-status/`);
};

export const getUserProfile = (id) => {
  return api.get(`admin/users/${id}/`);
};

export const createVehicle = (data) => {
  return api.post("products/", data);
};

export const updateVehicle = (id, data) => {
  return api.put(`products/${id}/`, data);
};

export const getVehicles = () => {
  return api.get("products/");
};