import api from "./axios";

// GET /api/products?search=&category=&brand=&page=&limit=
export const getProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data; // { success, total, count, page, pages, data: [] }
};

// GET /api/products/:id
export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data;
};

// POST /api/products  (multipart/form-data — supports images)
export const createProduct = async (formData) => {
  const { data } = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

// PUT /api/products/:id  (multipart/form-data)
export const updateProduct = async ({ id, formData }) => {
  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

// DELETE /api/products/:id  (soft delete → isActive: false)
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// PATCH /api/products/:id  (restore → isActive: true)
export const restoreProduct = async (id) => {
  const { data } = await api.patch(`/products/${id}`);
  return data;
};