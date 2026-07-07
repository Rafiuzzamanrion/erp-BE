import { z } from "zod";

export const createCategorySchema = z.object({
	name: z.string().min(1, "Category name is required").trim().toLowerCase(),
	description: z.string().trim().optional(),
});

export const updateCategorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.trim()
		.toLowerCase()
		.optional(),
	description: z.string().trim().optional(),
});

export const categoryIdParamsSchema = z.object({
	id: z.string().min(1, "Category ID is required"),
});

export const categoryQuerySchema = z.object({
	search: z.string().optional(),
	page: z
		.string()
		.optional()
		.transform((v) => (v ? parseInt(v, 10) : undefined))
		.pipe(z.number().int().min(1).optional()),
	limit: z
		.string()
		.optional()
		.transform((v) => (v ? parseInt(v, 10) : undefined))
		.pipe(z.number().int().min(1).max(100).optional()),
	sort: z.string().optional(),
});
