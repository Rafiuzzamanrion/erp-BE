import bcrypt from "bcrypt";
import { User } from "../users/user.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { generateToken } from "../../common/utils/generateToken";
import { LoginResponse, AuthMeResponse } from "./auth.types";

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

	const roleStr = user.role ? String(user.role) : "employee";
	const token = generateToken({ id: user._id.toString(), role: roleStr });

	return {
		token,
		user: {
			_id: user._id.toString(),
			name: user.name,
			email: user.email,
			role: roleStr,
			isActive: user.isActive,
		},
	};
};

export const getMe = async (userId: string): Promise<AuthMeResponse> => {
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError("User not found", HTTP_STATUS.NOT_FOUND);
	}

	return {
		_id: user._id.toString(),
		name: user.name,
		email: user.email,
		role: user.role ? String(user.role) : "employee",
		isActive: user.isActive,
	};
};
