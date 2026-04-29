import api from "./axios";

// GET /api/brands?search=&isActive=&page=&limit=
export const getBrands = async (params = {}) => {
  const { data } = await api.get("/brands", { params });
  return data; // { success, total, count, page, pages, data: [] }
};

// GET /api/brands/:id
export const getBrand = async (id) => {
  const { data } = await api.get(`/brands/${id}`);
  return data.data;
};

// POST /api/brands  (multipart — logo upload)
export const createBrand = async (formData) => {
  const { data } = await api.post("/brands", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

// PUT /api/brands/:id  (multipart — logo upload)
export const updateBrand = async ({ id, formData }) => {
  const { data } = await api.put(`/brands/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

// DELETE /api/brands/:id  (soft delete)
export const deleteBrand = async (id) => {
  const { data } = await api.delete(`/brands/${id}`);
  return data;
};

// PATCH /api/brands/:id/restore
export const restoreBrand = async (id) => {
  const { data } = await api.patch(`/brands/${id}/restore`);
  return data;
};