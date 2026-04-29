import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getsales,
  getsale,
  createSale,
  updateSale,
  deleteSale,
} from "../api/saleApi";

const KEY = "sales";

export const useSales = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => getsales(params),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

export const useSale = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getsale(id),
    enabled: Boolean(id),
  });

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSale,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useCancelSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSale,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
