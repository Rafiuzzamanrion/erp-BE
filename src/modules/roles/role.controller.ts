import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiResponse } from "../../common/utils/ApiResponse";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import * as roleService from "./role.service";

export const createRole = asyncHandler(async (req: Request, res: Response) => {
	const role = await roleService.createRole(req.body);
	ApiResponse.success(res, "Role created successfully", role, undefined, HTTP_STATUS.CREATED);
});

export const getRoles = asyncHandler(async (_req: Request, res: Response) => {
	const roles = await roleService.getRoles();
	ApiResponse.success(res, "Roles fetched successfully", roles);
});

export const getRole = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const role = await roleService.getRole(id);
	ApiResponse.success(res, "Role fetched successfully", role);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const role = await roleService.updateRole(id, req.body);
	ApiResponse.success(res, "Role updated successfully", role);
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const role = await roleService.deleteRole(id);
	ApiResponse.success(res, "Role deleted successfully", role);
});
