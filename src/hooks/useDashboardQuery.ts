import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/services/api";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });
}
