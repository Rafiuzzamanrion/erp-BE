import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
	PORT: z.coerce.number().int().positive().default(5000),
	MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
	JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
	JWT_EXPIRES_IN: z.string().default("1d"),
	CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
	CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
	CLOUDINARY_API_SECRET: z
		.string()
		.min(1, "CLOUDINARY_API_SECRET is required"),
	CLIENT_URL: z.string().url().default("http://localhost:5173"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Invalid environment variables:", parsed.error.format());
	process.exit(1);
}

export const env = parsed.data;
