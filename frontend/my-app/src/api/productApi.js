import api from "./axios";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds a FormData object for create / update.
 * price and stock must be sent as JSON strings (multipart/form-data).
 */
const buildProductFormData = ({
  name, description, category, supplier, brand,
  price, stock, isActive, images = [], removedImages = [],
}) => {
  const fd = new FormData();

  if (name        !== undefined) fd.append("name",        name);
  if (description !== undefined) fd.append("description", description);
  if (category    !== undefined) fd.append("category",    category);
  if (supplier    !== undefined) fd.append("supplier",    supplier);
  if (brand       !== undefined) fd.append("brand",       brand);
  if (isActive    !== undefined) fd.append("isActive",    String(isActive));

  // price & stock → JSON string (backend uses parseField)
  if (price) fd.append("price", JSON.stringify(price));
  if (stock) fd.append("stock", JSON.stringify(stock));

  // Image files (File objects from input[type=file])
  images.forEach((file, i) => {
    fd.append("images", file);
    fd.append(`altText_${i}`, file.altText ?? "");
  });

  // URLs of images to remove on update
  if (removedImages.length)
    fd.append("removedImages", JSON.stringify(removedImages));

  return fd;
};

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * GET /api/products
 * @param {Object} params - { search, category, brand, isActive, lowStock, page, limit }
 */
export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data; // { success, total, count, page, pages, data[] }
};

/**
 * GET /api/products/:id
 */
export const fetchProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data; // single product object
};

/**
 * POST /api/products  (multipart/form-data)
 * @param {Object} productData - form fields + images (File[])
 */
export const createProduct = async (productData) => {
  const fd = buildProductFormData(productData);
  const { data } = await api.post("/products", fd);
  return data.data;
};

/**
 * PUT /api/products/:id  (multipart/form-data)
 * @param {string} id
 * @param {Object} productData - partial fields to update
 */
export const updateProduct = async ({ id, ...productData }) => {
  const fd = buildProductFormData(productData);
  const { data } = await api.put(`/products/${id}`, fd);
  return data.data;
};

/**
 * DELETE /api/products/:id  (soft delete → isActive: false)
 */
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data; // { success, message, data }
};

/**
 * PATCH /api/products/:id  (restore → isActive: true)
 */
export const restoreProduct = async (id) => {
  const { data } = await api.patch(`/products/${id}`);
  return data; // { success, message, data }
};