import { z } from "zod";
import { createProductSchema, updateProductSchema, productQuerySchema } from "./product.schema";

export type CreateProductInput = z.output<typeof createProductSchema>;
export type UpdateProductInput = z.output<typeof updateProductSchema>;
export type ProductQuery = z.output<typeof productQuerySchema>;
