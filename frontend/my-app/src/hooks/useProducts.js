import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "../api/productApi";

const KEY = "products";

// ─── List (with filters + pagination) ─────────────────────────────────────
export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: [KEY, params],
    queryFn:  () => getProducts(params),
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,   // smooth pagination
  });
};

// ─── Single product ────────────────────────────────────────────────────────
export const useProduct = (id) => {
  return useQuery({
    queryKey: [KEY, id],
    queryFn:  () => getProduct(id),
    enabled:  Boolean(id),
  });
};

// ─── Create ───────────────────────────────────────────────────────────────
export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// ─── Update ───────────────────────────────────────────────────────────────
export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// ─── Delete (soft) ────────────────────────────────────────────────────────
export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// ─── Restore ──────────────────────────────────────────────────────────────
export const useRestoreProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};