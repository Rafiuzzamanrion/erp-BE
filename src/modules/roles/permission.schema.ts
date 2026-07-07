import { z } from "zod";

export const createPermissionSchema = z.object({
	key: z.string().min(1, "Permission key is required").trim(),
	description: z.string().min(1, "Description is required"),
});

export const updatePermissionSchema = z.object({
	key: z.string().min(1, "Permission key is required").trim().optional(),
	description: z.string().min(1, "Description is required").optional(),
});

export const permissionIdParamsSchema = z.object({
	id: z.string().min(1, "Permission ID is required"),
});
