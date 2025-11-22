import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  description: z.string().default(""),
  sku: z
    .string()
    .min(4, { message: "O SKU deve ter pelo menos 4 caracteres." }),
  categoryId: z.string().min(1, { message: "Selecione uma categoria." }),
  price: z.coerce
    .number()
    .positive({ message: "O preço deve ser um número positivo." }),
  cost: z.coerce
    .number()
    .positive({ message: "O custo deve ser um número positivo." }),
  currentStock: z.coerce
    .number()
    .int()
    .nonnegative({ message: "O estoque não pode ser negativo." }),
  minStock: z.coerce
    .number()
    .int()
    .nonnegative({ message: "O estoque mínimo não pode ser negativo." }),
  maxStock: z.coerce
    .number()
    .int()
    .nonnegative({ message: "O estoque máximo não pode ser negativo." }),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;
