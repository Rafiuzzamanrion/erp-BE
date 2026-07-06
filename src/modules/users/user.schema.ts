import { z } from "zod";

export const createUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	role: z.enum(["admin", "manager", "employee"]).optional(),
	isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
	name: z.string().min(1, "Name is required").optional(),
	email: z.string().email("Invalid email address").optional(),
	password: z.string().min(6, "Password must be at least 6 characters").optional(),
	role: z.enum(["admin", "manager", "employee"]).optional(),
	isActive: z.boolean().optional(),
});
