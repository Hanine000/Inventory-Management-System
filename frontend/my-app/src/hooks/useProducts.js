import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts, fetchProduct,
  createProduct, updateProduct,
  deleteProduct, restoreProduct,
} from "../api/productApi";

// ─── Query Key Factory ─────────────────────────────────────────────────────────
export const productKeys = {
  all:    ["products"],
  list:   (params) =>  ["products", "list", params],
  detail: (id)     =>  ["products", "detail", id],
};

// ─── GET ALL PRODUCTS ──────────────────────────────────────────────────────────
/**
 * @param {Object} params - { search, category, brand, isActive, lowStock, page, limit }
 * @returns paginated response: { data[], total, page, pages, count }
 */
export const useGetProducts = (params = {}) =>
  useQuery({
    queryKey: productKeys.list(params),
    queryFn:  () => fetchProducts(params),
    staleTime: 1000 * 60 * 2, // 2 min
    keepPreviousData: true,   // smooth pagination
  });

// ─── GET SINGLE PRODUCT ────────────────────────────────────────────────────────
export const useGetProduct = (id) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn:  () => fetchProduct(id),
    enabled:  !!id, // only run when id exists
    staleTime: 1000 * 60 * 5,
  });

// ─── CREATE PRODUCT ────────────────────────────────────────────────────────────
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate all product lists so they re-fetch
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

// ─── UPDATE PRODUCT ────────────────────────────────────────────────────────────
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      // Update the detail cache immediately (optimistic-style)
      queryClient.setQueryData(
        productKeys.detail(updatedProduct._id),
        updatedProduct
      );
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

// ─── DELETE PRODUCT (soft) ─────────────────────────────────────────────────────
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

// ─── RESTORE PRODUCT ──────────────────────────────────────────────────────────
export const useRestoreProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};