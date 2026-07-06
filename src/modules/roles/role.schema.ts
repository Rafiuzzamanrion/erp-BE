import { z } from "zod";

export const createRoleSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	permissions: z.array(z.string()).optional(),
	isSystem: z.boolean().optional(),
});

export const updateRoleSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
	permissions: z.array(z.string()).optional(),
	isSystem: z.boolean().optional(),
});
