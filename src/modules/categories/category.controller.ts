import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiResponse } from "../../common/utils/ApiResponse";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import * as categoryService from "./category.service";
import {
	createCategorySchema,
	updateCategorySchema,
	categoryIdParamsSchema,
} from "./category.schema";

export const createCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const data = createCategorySchema.parse(req.body);
		const category = await categoryService.createCategory(data);
		ApiResponse.success(
			res,
			"Category created successfully",
			category,
			undefined,
			HTTP_STATUS.CREATED
		);
	}
);

export const getCategories = asyncHandler(
	async (_req: Request, res: Response) => {
		const categories = await categoryService.getCategories();
		ApiResponse.success(res, "Categories fetched successfully", categories);
	}
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
	const { id } = categoryIdParamsSchema.parse(req.params);
	const category = await categoryService.getCategory(id);
	ApiResponse.success(res, "Category fetched successfully", category);
});

export const updateCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = categoryIdParamsSchema.parse(req.params);
		const data = updateCategorySchema.parse(req.body);
		const category = await categoryService.updateCategory(id, data);
		ApiResponse.success(res, "Category updated successfully", category);
	}
);

export const deleteCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = categoryIdParamsSchema.parse(req.params);
		await categoryService.deleteCategory(id);
		ApiResponse.success(res, "Category deleted successfully");
	}
);
