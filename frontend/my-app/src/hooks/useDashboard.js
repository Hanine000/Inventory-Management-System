import { useQuery } from "@tanstack/react-query";
import { getDashboardStats,
   getLowStock,
   getSalesLast7Days,
   getSalesByCategory,
   getTopProducts
 } from "../api/dashboardApi";

// ─── All KPIs in one request ───────────────────────────────────────────────
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 2,   // 2 min — dashboard data refreshes often
    refetchOnWindowFocus: true,
  });
};

// ─── Low stock products list ───────────────────────────────────────────────
export const useLowStock = () => {
  return useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: getLowStock,
    staleTime: 1000 * 60 * 2,
  });
};
export const useSalesLast7Days = () => {
  return useQuery({
    queryKey: ["dashboard", "sales-7-days"],
    queryFn:  getSalesLast7Days,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSalesByCategory = () => {
  return useQuery({
    queryKey: ["dashboard", "sales-by-category"],
    queryFn:  getSalesByCategory,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ["dashboard", "top-products"],
    queryFn:  getTopProducts,
    staleTime: 1000 * 60 * 5,
  });
};