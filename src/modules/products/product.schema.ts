import { z } from "zod";

export const createProductSchema = z.object({
	name: z.string().min(1, "Product name is required").max(100),
	sku: z.string().min(1, "SKU is required").max(50),
	category: z.string().min(1, "Category is required").max(50),
	purchasePrice: z.string().transform(Number).pipe(z.number().min(0, "Purchase price must be non-negative")),
	sellingPrice: z.string().transform(Number).pipe(z.number().min(0, "Selling price must be non-negative")),
	stockQuantity: z
		.string()
		.optional()
		.transform((v) => (v !== undefined ? Number(v) : 0))
		.pipe(z.number().int().min(0)),
});

export const updateProductSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	sku: z.string().min(1).max(50).optional(),
	category: z.string().min(1).max(50).optional(),
	purchasePrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
	sellingPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
	stockQuantity: z
		.string()
		.optional()
		.transform((v) => (v !== undefined ? Number(v) : undefined))
		.pipe(z.number().int().min(0).optional()),
});

export const productQuerySchema = z.object({
	search: z.string().optional(),
	category: z.string().optional(),
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

export const productIdParamsSchema = z.object({
	id: z.string().min(1, "Product ID is required"),
});
