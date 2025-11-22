import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/services/api";

export function useSalesQuery() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: getSales,
  });
}
