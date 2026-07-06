export const ROLES = {
	ADMIN: "admin",
	MANAGER: "manager",
	EMPLOYEE: "employee",
} as const;

export const PERMISSIONS = {
	PRODUCT_CREATE: "product:create",
	PRODUCT_UPDATE: "product:update",
	PRODUCT_DELETE: "product:delete",
	PRODUCT_VIEW: "product:view",
	SALE_CREATE: "sale:create",
	SALE_VIEW: "sale:view",
	USER_MANAGE: "user:manage",
	ROLE_MANAGE: "role:manage",
	DASHBOARD_VIEW: "dashboard:view",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
