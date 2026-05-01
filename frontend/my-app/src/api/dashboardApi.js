import api from "./axios";

// GET /api/dashboard/stats
// Returns: { totalProducts, totalCategories, totalRevenue, totalSalesCount, lowStockCount }
export const getDashboardStats = async () => {
  const { data } = await api.get("/dashboard/stats");
  return data.data;
};

// GET /api/dashboard/low-stock
export const getLowStock = async () => {
  const { data } = await api.get("/dashboard/low-stock");
  return data.data;
};

export const getSalesLast7Days = async () => {
  const { data } = await api.get("/dashboard/sales-last-7-days");
  return data.data;
};

export const getSalesByCategory = async () => {
  const { data } = await api.get("/dashboard/sales-by-category");
  return data.data;
};

export const getTopProducts = async () => {
  const { data } = await api.get("/dashboard/top-products");
  return data.data;
};