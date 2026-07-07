import { User, IUser } from "./user.model";
import { Role } from "../roles/role.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { CreateUserInput, UpdateUserInput } from "./user.types";

export const findByEmail = async (email: string): Promise<IUser | null> => {
	return User.findOne({ email });
};

export const findById = async (id: string): Promise<IUser | null> => {
	return User.findById(id).populate("role", "name");
};

export const createUser = async (data: CreateUserInput): Promise<IUser> => {
	const existing = await findByEmail(data.email);
	if (existing) {
		throw new ApiError(
			"User with this email already exists",
			HTTP_STATUS.CONFLICT
		);
	}

	if (data.role) {
		const roleDoc = await Role.findOne({ name: data.role });
		if (roleDoc) {
			return User.create({ ...data, role: roleDoc._id });
		}
	}

	return User.create(data);
};

export const listUsers = async (
	search?: string
): Promise<Record<string, unknown>[]> => {
	const filter: Record<string, unknown> = {};
	if (search) {
		const searchRegex = new RegExp(
			search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
			"i"
		);
		filter.$or = [
			{ name: { $regex: searchRegex } },
			{ email: { $regex: searchRegex } },
		];
	}

	const users = await User.find(filter)
		.populate("role", "name")
		.sort({ createdAt: -1 })
		.lean();
	return users.map((u) => ({
		...u,
		role: (u.role as { name?: string } | null)?.name ?? null,
	}));
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
	if (data.role) {
		const roleDoc = await Role.findOne({ name: data.role });
		if (roleDoc) {
			user.role = roleDoc._id;
		}
	}
	const fieldsToAssign: Partial<IUser> = {};
	if (data.name !== undefined) fieldsToAssign.name = data.name;
	if (data.email !== undefined) fieldsToAssign.email = data.email;
	if (data.isActive !== undefined) fieldsToAssign.isActive = data.isActive;
	Object.assign(user, fieldsToAssign);
	return user.save();
};

export const deleteUser = async (id: string): Promise<void> => {
	const user = await User.findByIdAndDelete(id);
	if (!user) {
		throw new ApiError("User not found", HTTP_STATUS.NOT_FOUND);
	}
};
