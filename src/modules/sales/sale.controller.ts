import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiResponse } from "../../common/utils/ApiResponse";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import * as saleService from "./sale.service";
import { createSaleSchema, saleQuerySchema, saleIdParamsSchema } from "./sale.schema";

const getUserId = (req: Request): string => {
	return (req as unknown as Record<string, { id: string }>).user?.id || "";
};

export const createSale = asyncHandler(async (req: Request, res: Response) => {
	const data = createSaleSchema.parse(req.body);
	const sale = await saleService.createSale(data, getUserId(req));
	ApiResponse.success(res, "Sale created successfully", sale, undefined, HTTP_STATUS.CREATED);
});

export const getSales = asyncHandler(async (req: Request, res: Response) => {
	const query = saleQuerySchema.parse(req.query);
	const result = await saleService.getSales(query);
	ApiResponse.success(res, "Sales fetched successfully", result.sales, result.meta);
});

export const getSaleById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = saleIdParamsSchema.parse(req.params);
	const sale = await saleService.getSaleById(id);
	ApiResponse.success(res, "Sale fetched successfully", sale);
});
