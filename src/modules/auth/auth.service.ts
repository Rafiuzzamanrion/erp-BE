import bcrypt from "bcrypt";
import { User } from "../users/user.model";
import { Role } from "../roles/role.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { generateToken } from "../../common/utils/generateToken";
import { LoginResponse, AuthMeResponse } from "./auth.types";

const resolveRoleName = async (roleId: unknown): Promise<string> => {
	if (!roleId) return "employee";
	const role = await Role.findById(roleId).select("name").lean();
	return role?.name ?? "employee";
};

export const login = async (
	email: string,
	password: string
): Promise<LoginResponse> => {
	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		throw new ApiError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new ApiError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
	}

	if (!user.isActive) {
		throw new ApiError(
			"Your account has been deactivated. Please contact an administrator.",
			HTTP_STATUS.UNAUTHORIZED
		);
	}

	const roleId = user.role ? String(user.role) : "employee";
	const roleName = await resolveRoleName(user.role);
	const token = generateToken({ id: user._id.toString(), role: roleId });

	return {
		token,
		user: {
			_id: user._id.toString(),
			name: user.name,
			email: user.email,
			role: roleName,
			isActive: user.isActive,
		},
	};
};

export const getMe = async (userId: string): Promise<AuthMeResponse> => {
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError("User not found", HTTP_STATUS.NOT_FOUND);
	}

	const roleName = await resolveRoleName(user.role);

	return {
		_id: user._id.toString(),
		name: user.name,
		email: user.email,
		role: roleName,
		isActive: user.isActive,
	};
};
