import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStockMovement } from "@/services/api";

const STOCK_MOVEMENTS_KEY = ["stockMovements"];

export interface AddStockMovementInput {
  productId: string;
  type: "ENTRADA" | "SAÍDA";
  quantity: number;
  reason: string;
}

export function useAddStockMovementMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["addStockMovement"],
    mutationFn: async (input: AddStockMovementInput) => {
      await addStockMovement(
        input.productId,
        input.type,
        input.quantity,
        input.reason
      );
      return input;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOCK_MOVEMENTS_KEY });
    },
  });
}
