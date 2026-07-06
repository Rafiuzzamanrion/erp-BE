import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ApiResponse } from "../../common/utils/ApiResponse";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import * as userService from "./user.service";
import { createUserSchema, updateUserSchema } from "./user.schema";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
	const users = await userService.listUsers();
	ApiResponse.success(res, "Users retrieved successfully", users);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const user = await userService.findById(id);
	if (!user) {
		ApiResponse.success(res, "User not found", null);
		return;
	}
	ApiResponse.success(res, "User retrieved successfully", user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
	const data = createUserSchema.parse(req.body);
	const user = await userService.createUser(data);
	ApiResponse.success(res, "User created successfully", user, undefined, HTTP_STATUS.CREATED);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const data = updateUserSchema.parse(req.body);
	const user = await userService.updateUser(id, data);
	ApiResponse.success(res, "User updated successfully", user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
	const id = String(req.params.id);
	await userService.deleteUser(id);
	ApiResponse.success(res, "User deleted successfully");
});
