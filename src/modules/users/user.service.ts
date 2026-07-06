import { User, IUser } from "./user.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { CreateUserInput, UpdateUserInput } from "./user.types";

export const findByEmail = async (email: string): Promise<IUser | null> => {
	return User.findOne({ email });
};

export const findById = async (id: string): Promise<IUser | null> => {
	return User.findById(id);
};

export const createUser = async (data: CreateUserInput): Promise<IUser> => {
	const existing = await findByEmail(data.email);
	if (existing) {
		throw new ApiError(
			"User with this email already exists",
			HTTP_STATUS.CONFLICT
		);
	}
	return User.create(data);
};

export const listUsers = async (): Promise<IUser[]> => {
	return User.find().sort({ createdAt: -1 });
};

export const updateUser = async (
	id: string,
	data: UpdateUserInput
): Promise<IUser | null> => {
	const user = await User.findById(id);
	if (!user) {
		throw new ApiError("User not found", HTTP_STATUS.NOT_FOUND);
	}
	if (data.email && data.email !== user.email) {
		const existing = await findByEmail(data.email);
		if (existing) {
			throw new ApiError(
				"User with this email already exists",
				HTTP_STATUS.CONFLICT
			);
		}
	}
	if (data.password) {
		user.password = data.password;
	}
	Object.assign(user, data);
	return user.save();
};

export const deleteUser = async (id: string): Promise<void> => {
	const user = await User.findByIdAndDelete(id);
	if (!user) {
		throw new ApiError("User not found", HTTP_STATUS.NOT_FOUND);
	}
};
