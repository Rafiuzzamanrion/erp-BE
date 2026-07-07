import { Permission, IPermission } from "./permission.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import {
	CreatePermissionInput,
	UpdatePermissionInput,
} from "./permission.types";

export const createPermission = async (
	data: CreatePermissionInput
): Promise<IPermission> => {
	const existing = await Permission.findOne({ key: data.key });
	if (existing) {
		throw new ApiError(
			"Permission with this key already exists",
			HTTP_STATUS.CONFLICT
		);
	}

	const permission = await Permission.create(data);
	return permission;
};

export const getPermissions = async (): Promise<IPermission[]> => {
	const permissions = await Permission.find().lean();
	return permissions as IPermission[];
};

export const getPermission = async (id: string): Promise<IPermission> => {
	const permission = await Permission.findById(id).lean();
	if (!permission) {
		throw new ApiError("Permission not found", HTTP_STATUS.NOT_FOUND);
	}
	return permission as IPermission;
};

export const updatePermission = async (
	id: string,
	data: UpdatePermissionInput
): Promise<IPermission> => {
	const permission = await Permission.findById(id);
	if (!permission) {
		throw new ApiError("Permission not found", HTTP_STATUS.NOT_FOUND);
	}

	if (data.key && data.key !== permission.key) {
		const existing = await Permission.findOne({ key: data.key });
		if (existing) {
			throw new ApiError(
				"Permission with this key already exists",
				HTTP_STATUS.CONFLICT
			);
		}
	}

	Object.assign(permission, data);
	await permission.save();
	return permission;
};

export const deletePermission = async (id: string): Promise<IPermission> => {
	const permission = await Permission.findById(id);
	if (!permission) {
		throw new ApiError("Permission not found", HTTP_STATUS.NOT_FOUND);
	}

	await permission.deleteOne();
	return permission;
};
