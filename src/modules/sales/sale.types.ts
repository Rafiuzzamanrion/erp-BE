import { z } from "zod";
import { createSaleSchema, saleQuerySchema } from "./sale.schema";

export type CreateSaleInput = z.output<typeof createSaleSchema>;
export type SaleQuery = z.output<typeof saleQuerySchema>;
