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
