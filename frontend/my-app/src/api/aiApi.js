import api from "./axios";

// GET /api/aiInsights/alerts
// Returns: { lowStockCount, overStockCount, lowStock[], overStock[] }
export const getAlerts = async () => {
  const { data } = await api.get("/aiInsights/alerts");
  return data.data;
};

// GET /api/aiInsights/top-products
// Returns: { period, bestSellers[], slowMovers[] }
export const getTopProducts = async () => {
  const { data } = await api.get("/aiInsights/top-products");
  return data.data;
};

// GET /api/aiInsights/forecast
// Returns: { generatedAt, forecast[] }
export const getForecast = async () => {
  const { data } = await api.get("/aiInsights/forecast");
  return data.data;
};