import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/services/api";

export function useCustomersQuery() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
}
