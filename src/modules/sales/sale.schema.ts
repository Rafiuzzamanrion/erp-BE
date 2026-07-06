import { z } from "zod";

export const createSaleSchema = z.object({
	items: z
		.array(
			z.object({
				productId: z.string().min(1, "Product ID is required"),
				quantity: z.number().int().min(1, "Quantity must be at least 1"),
			})
		)
		.min(1, "At least one item is required"),
});

export const saleQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((v) => (v ? parseInt(v, 10) : 1))
		.pipe(z.number().int().min(1)),
	limit: z
		.string()
		.optional()
		.transform((v) => (v ? parseInt(v, 10) : 10))
		.pipe(z.number().int().min(1).max(100)),
	sort: z.string().optional(),
});

export const saleIdParamsSchema = z.object({
	id: z.string().min(1, "Sale ID is required"),
});
