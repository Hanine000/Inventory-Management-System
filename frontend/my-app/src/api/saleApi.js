import api from "./axios";

// GET /api/sales?search=&isActive=&page=&limit=
export const getsales = async (params = {}) => {
  const { data } = await api.get("/sales", { params });
  return data; 
};

// GET /api/sales/:id
export const getsale = async (id) => {
  const { data } = await api.get(`/sales/${id}`);
  return data.data;
};

// POST /api/sales
export const createSale = async (body) => {
  const { data } = await api.post("/sales", body);
  return data.data;
};

// PUT /api/sales/:id
export const updateSale = async ({ id, body }) => {
  const { data } = await api.put(`/sales/${id}`, body);
  return data.data;
};

// DELETE /api/sales/:id  (soft delete)
export const deleteSale = async (id) => {
  const { data } = await api.delete(`/sales/${id}`);
  return data;
};
