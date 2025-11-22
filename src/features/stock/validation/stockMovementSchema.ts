import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().min(1, { message: "Selecione um produto." }),
  quantity: z.coerce
    .number()
    .int()
    .positive({ message: "A quantidade deve ser maior que zero." }),
  reason: z
    .string()
    .min(3, { message: "O motivo deve ter pelo menos 3 caracteres." }),
});

export type StockMovementFormInput = z.input<typeof stockMovementSchema>;
export type StockMovementFormValues = z.output<typeof stockMovementSchema>;
