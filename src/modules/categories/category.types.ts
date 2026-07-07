import { z } from "zod";
import {
	createCategorySchema,
	updateCategorySchema,
	categoryIdParamsSchema,
	categoryQuerySchema,
} from "./category.schema";

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;
export type CategoryQuery = z.output<typeof categoryQuerySchema>;
