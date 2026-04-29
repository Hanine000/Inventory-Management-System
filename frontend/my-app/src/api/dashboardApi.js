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