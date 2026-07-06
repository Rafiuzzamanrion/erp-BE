import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiResponse } from "../../common/utils/ApiResponse";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import * as productService from "./product.service";
import { createProductSchema, updateProductSchema, productQuerySchema, productIdParamsSchema } from "./product.schema";

const getUserId = (req: Request): string => {
	return (req as unknown as Record<string, { id: string }>).user?.id || "";
};

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
	const parsed = createProductSchema.parse(req.body);
	const product = await productService.createProduct(parsed, req.file, getUserId(req));
	ApiResponse.success(res, "Product created successfully", product, undefined, HTTP_STATUS.CREATED);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
	const query = productQuerySchema.parse(req.query);
	const result = await productService.getProducts(query);
	ApiResponse.success(res, "Products fetched successfully", result.products, result.meta);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = productIdParamsSchema.parse(req.params);
	const product = await productService.getProductById(id);
	ApiResponse.success(res, "Product fetched successfully", product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
	const { id } = productIdParamsSchema.parse(req.params);
	const data = updateProductSchema.parse(req.body);
	const product = await productService.updateProduct(id, data, req.file);
	ApiResponse.success(res, "Product updated successfully", product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
	const { id } = productIdParamsSchema.parse(req.params);
	await productService.deleteProduct(id);
	ApiResponse.success(res, "Product deleted successfully");
});
