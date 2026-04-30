import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../api/orderApi";

const KEY = "orders";

export const useOrders = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => getOrders(params),
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

export const useOrder = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      // Receiving an order updates stock — invalidate products + dashboard too
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};