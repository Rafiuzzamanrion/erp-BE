import { Role, IRole } from "./role.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { CreateRole, UpdateRole } from "./role.types";

export const getRolePermissions = async (roleId: string): Promise<string[]> => {
	const role = await Role.findById(roleId)
		.populate<{ permissions: Array<{ key: string }> }>("permissions")
		.lean();

	if (!role) {
		throw new ApiError("Role not found", HTTP_STATUS.NOT_FOUND);
	}

	return role.permissions.map((p) => p.key);
};

export const createRole = async (data: CreateRole): Promise<IRole> => {
	const existing = await Role.findOne({ name: data.name });
	if (existing) {
		throw new ApiError("Role with this name already exists", HTTP_STATUS.CONFLICT);
	}

	const role = await Role.create(data);
	return role;
};

export const getRoles = async (): Promise<IRole[]> => {
	const roles = await Role.find().populate("permissions").lean();
	return roles as IRole[];
};

export const getRole = async (id: string): Promise<IRole> => {
	const role = await Role.findById(id).populate("permissions").lean();
	if (!role) {
		throw new ApiError("Role not found", HTTP_STATUS.NOT_FOUND);
	}
	return role as IRole;
};

export const updateRole = async (id: string, data: UpdateRole): Promise<IRole> => {
	const role = await Role.findById(id);
	if (!role) {
		throw new ApiError("Role not found", HTTP_STATUS.NOT_FOUND);
	}

	if (data.name && data.name !== role.name) {
		const existing = await Role.findOne({ name: data.name });
		if (existing) {
			throw new ApiError("Role with this name already exists", HTTP_STATUS.CONFLICT);
		}
	}

	Object.assign(role, data);
	await role.save();
	return role;
};

export const deleteRole = async (id: string): Promise<IRole> => {
	const role = await Role.findById(id);
	if (!role) {
		throw new ApiError("Role not found", HTTP_STATUS.NOT_FOUND);
	}

	if (role.isSystem) {
		throw new ApiError("Cannot delete a system role", HTTP_STATUS.FORBIDDEN);
	}

	await role.deleteOne();
	return role;
};
