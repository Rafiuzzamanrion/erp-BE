import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../common/utils/ApiError";
import { HTTP_STATUS } from "../common/constants/httpStatus.constant";
import { env } from "../config/env";

export interface AuthPayload {
	id: string;
	role: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload;
		}
	}
}

export const authenticate = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next(
			new ApiError(
				"Access denied. No token provided.",
				HTTP_STATUS.UNAUTHORIZED
			)
		);
	}

	const token = authHeader.split(" ")[1];
	if (!token) {
		return next(
			new ApiError(
				"Access denied. No token provided.",
				HTTP_STATUS.UNAUTHORIZED
			)
		);
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
		req.user = decoded;
		next();
	} catch {
		return next(
			new ApiError("Invalid or expired token.", HTTP_STATUS.UNAUTHORIZED)
		);
	}
};
