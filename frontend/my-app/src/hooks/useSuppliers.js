import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
} from "../api/supplierApi";

const KEY = "suppliers";

export const useSuppliers = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => getSuppliers(params),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

export const useSupplier = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getSupplier(id),
    enabled: Boolean(id),
  });

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useRestoreSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: restoreSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};