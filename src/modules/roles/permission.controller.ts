import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiResponse } from "../../common/utils/ApiResponse";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import * as permissionService from "./permission.service";

export const createPermission = asyncHandler(async (req: Request, res: Response) => {
	const permission = await permissionService.createPermission(req.body);
	ApiResponse.success(res, "Permission created successfully", permission, undefined, HTTP_STATUS.CREATED);
});

export const getPermissions = asyncHandler(async (_req: Request, res: Response) => {
	const permissions = await permissionService.getPermissions();
	ApiResponse.success(res, "Permissions fetched successfully", permissions);
});

export const getPermission = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const permission = await permissionService.getPermission(id);
	ApiResponse.success(res, "Permission fetched successfully", permission);
});

export const updatePermission = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const permission = await permissionService.updatePermission(id, req.body);
	ApiResponse.success(res, "Permission updated successfully", permission);
});

export const deletePermission = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const permission = await permissionService.deletePermission(id);
	ApiResponse.success(res, "Permission deleted successfully", permission);
});
