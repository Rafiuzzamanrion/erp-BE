import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiResponse } from "../../common/utils/ApiResponse";
import { dashboardQuerySchema } from "./dashboard.schema";
import * as dashboardService from "./dashboard.service";

export const getStats = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const query = dashboardQuerySchema.parse(req.query);
		const data = await dashboardService.getStats(query);
		ApiResponse.success(res, "Dashboard stats retrieved successfully", data);
	}
);

export const getLowStockAlerts = asyncHandler(
	async (_req: Request, res: Response): Promise<void> => {
		const data = await dashboardService.getLowStockAlerts();
		ApiResponse.success(res, "Low stock alerts retrieved successfully", data);
	}
);
