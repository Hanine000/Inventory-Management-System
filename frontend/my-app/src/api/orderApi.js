import api from "./axios";

// GET /api/order?status=&supplier=&page=&limit=
export const getOrders = async (params = {}) => {
  const { data } = await api.get("/order", { params });
  return data; // { success, data: [], pagination: { total, page, limit } }
};

// GET /api/order/:id
export const getOrder = async (id) => {
  const { data } = await api.get(`/order/${id}`);
  return data.data;
};

// POST /api/order
// Body: { supplier, items: [{ product, quantity, unitCost }] }
export const createOrder = async (body) => {
  const { data } = await api.post("/order", body);
  return data.data;
};

// PATCH /api/order/:id/status
// Body: { status: "Accepted" | "Received" | "Cancelled" }
export const updateOrderStatus = async ({ id, status }) => {
  const { data } = await api.patch(`/order/${id}/status`, { status });
  return data.data;
};

// DELETE /api/order/:id  (only Cancelled orders)
export const deleteOrder = async (id) => {
  const { data } = await api.delete(`/order/${id}`);
  return data;
};