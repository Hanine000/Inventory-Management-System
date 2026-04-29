import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getLowStock } from "../api/dashboardApi";

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