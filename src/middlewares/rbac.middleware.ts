import { Request, Response, NextFunction } from "express";
import { ApiError } from "../common/utils/ApiError";
import { HTTP_STATUS } from "../common/constants/httpStatus.constant";
import { Role } from "../modules/roles/role.model";

const permissionCache = new Map<
	string,
	{ permissions: string[]; roleName: string; expiry: number }
>();
const CACHE_TTL = 60 * 1000;

const resolveRoleName = async (roleId: string): Promise<string | null> => {
	const cached = permissionCache.get(roleId);
	if (cached && cached.expiry > Date.now()) {
		return cached.roleName;
	}

	const role = await Role.findById(roleId).lean();
	if (!role) return null;

	const permissions = await Role.findById(roleId)
		.populate<{ permissions: Array<{ key: string }> }>("permissions")
		.lean();

	permissionCache.set(roleId, {
		permissions: permissions?.permissions.map((p) => p.key) ?? [],
		roleName: role.name,
		expiry: Date.now() + CACHE_TTL,
	});

	return role.name;
};

export const authorize =
	(...allowedRoles: string[]) =>
	async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		try {
			if (!req.user) {
				return next(
					new ApiError("Not authenticated", HTTP_STATUS.UNAUTHORIZED)
				);
			}

			if (allowedRoles.length === 0) {
				return next();
			}

			const roleName = await resolveRoleName(req.user.role);

			if (!roleName || !allowedRoles.includes(roleName)) {
				return next(
					new ApiError(
						"You do not have permission to perform this action",
						HTTP_STATUS.FORBIDDEN
					)
				);
			}

			next();
		} catch (error) {
			next(error);
		}
	};

export const requirePermission =
	(permissionKey: string) =>
	async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		try {
			if (!req.user) {
				return next(
					new ApiError("Not authenticated", HTTP_STATUS.UNAUTHORIZED)
				);
			}

			const cached = permissionCache.get(req.user.role);
			if (cached && cached.expiry > Date.now()) {
				if (cached.permissions.includes(permissionKey)) {
					return next();
				}
				return next(
					new ApiError(
						"Insufficient permissions",
						HTTP_STATUS.FORBIDDEN
					)
				);
			}

			const role = await Role.findById(req.user.role)
				.populate<{ permissions: Array<{ key: string }> }>("permissions")
				.lean();

			if (!role) {
				const fallback = { roleName: "unknown", permissions: [] as string[] };
				permissionCache.set(req.user.role, {
					...fallback,
					expiry: Date.now() + CACHE_TTL,
				});
				return next(
					new ApiError(
						"Insufficient permissions",
						HTTP_STATUS.FORBIDDEN
					)
				);
			}

			const permissions = role.permissions.map(
				(p: { key: string }) => p.key
			);
			permissionCache.set(req.user.role, {
				permissions,
				roleName: role.name,
				expiry: Date.now() + CACHE_TTL,
			});

			if (permissions.includes(permissionKey)) {
				return next();
			}

			return next(
				new ApiError("Insufficient permissions", HTTP_STATUS.FORBIDDEN)
			);
		} catch (error) {
			return next(error);
		}
	};
