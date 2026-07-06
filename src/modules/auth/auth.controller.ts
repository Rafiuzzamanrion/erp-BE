import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiResponse } from "../../common/utils/ApiResponse";
import { loginSchema } from "./auth.schema";
import * as authService from "./auth.service";

export const login = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const body = loginSchema.parse(req.body);
		const data = await authService.login(body.email, body.password);
		ApiResponse.success(res, "Login successful", data);
	}
);

export const me = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const data = await authService.getMe(req.user!.id);
		ApiResponse.success(res, "User retrieved successfully", data);
	}
);

export const logout = asyncHandler(
	async (_req: Request, res: Response): Promise<void> => {
		ApiResponse.success(res, "Logged out successfully");
	}
);
