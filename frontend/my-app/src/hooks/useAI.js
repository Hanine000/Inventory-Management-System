import { useQuery } from "@tanstack/react-query";
import { getAlerts, getTopProducts, getForecast } from "../api/aiApi";

// Alerts refresh more often — stock changes frequently
export const useAlerts = () =>
  useQuery({
    queryKey: ["ai", "alerts"],
    queryFn: getAlerts,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

export const useTopProducts = () =>
  useQuery({
    queryKey: ["ai", "top-products"],
    queryFn: getTopProducts,
    staleTime: 1000 * 60 * 5,
  });

export const useForecast = () =>
  useQuery({
    queryKey: ["ai", "forecast"],
    queryFn: getForecast,
    staleTime: 1000 * 60 * 10,
  });