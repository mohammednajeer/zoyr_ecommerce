import api from "../api/api";

export const getAdminDashboard = () => {
  return api.get("products/admin/dashboard/");
};

export const getAdminUsers = () => {
  return api.get("admin/users/");
};

export const getAdminOrders = () => {
  return api.get("admin/orders/");
};