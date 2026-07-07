import { z } from "zod";
import {
	createCategorySchema,
	updateCategorySchema,
	categoryIdParamsSchema,
} from "./category.schema";

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;
