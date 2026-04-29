import api from "./axios";

// GET /api/suppliers?search=&isActive=&page=&limit=
export const getSuppliers = async (params = {}) => {
  const { data } = await api.get("/suppliers", { params });
  return data; // { success, total, count, page, pages, data: [] }
};

// GET /api/suppliers/:id
export const getSupplier = async (id) => {
  const { data } = await api.get(`/suppliers/${id}`);
  return data.data;
};

// POST /api/suppliers
export const createSupplier = async (body) => {
  const { data } = await api.post("/suppliers", body);
  return data.data;
};

// PUT /api/suppliers/:id
export const updateSupplier = async ({ id, body }) => {
  const { data } = await api.put(`/suppliers/${id}`, body);
  return data.data;
};

// DELETE /api/suppliers/:id  (soft delete)
export const deleteSupplier = async (id) => {
  const { data } = await api.delete(`/suppliers/${id}`);
  return data;
};

// PATCH /api/suppliers/:id  (restore)
export const restoreSupplier = async (id) => {
  const { data } = await api.patch(`/suppliers/${id}`);
  return data;
};