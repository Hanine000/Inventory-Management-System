import api from "./axios";

// GET /api/categories
// Returns: { success, data: [{ categoryId, name, productCount }] }
export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data.data;
};

// POST /api/categories
export const createCategory = async (body) => {
  const { data } = await api.post("/categories", body);
  return data.data;
};

// PUT /api/categories/:id
export const updateCategory = async ({ id, body }) => {
  const { data } = await api.put(`/categories/${id}`, body);
  return data.data;
};

// DELETE /api/categories/:id
export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};