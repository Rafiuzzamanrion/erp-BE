import { z } from "zod";
import { loginSchema } from "./auth.schema";

export type LoginInput = z.output<typeof loginSchema>;

export interface LoginResponse {
	token: string;
	user: {
		_id: string;
		name: string;
		email: string;
		role: string;
		isActive: boolean;
	};
}

export interface AuthMeResponse {
	_id: string;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
}
