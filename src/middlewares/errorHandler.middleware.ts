import { Request, Response, NextFunction } from "express";
import { ApiError } from "../common/utils/ApiError";
import { ApiResponse } from "../common/utils/ApiResponse";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction
): void => {
	let statusCode = 500;
	let message = "Internal Server Error";
	let errors: Array<{ field: string; message: string }> | undefined = undefined;

	if (err instanceof ApiError) {
		statusCode = err.statusCode;
		message = err.message;
		if (err.errors) {
			ApiResponse.error(res, message, statusCode, err.errors);
			return;
		}
	} else if (err.name === "CastError") {
		statusCode = 400;
		message = "Invalid ID format";
	} else if (err.name === "ValidationError" && "errors" in err) {
		statusCode = 400;
		message = "Validation failed";
		const mongooseErr = err as unknown as {
			errors: Record<string, { path: string; message: string }>;
		};
		const validationErrors = Object.values(mongooseErr.errors).map((e) => ({
			field: e.path,
			message: e.message,
		}));
		ApiResponse.error(res, message, statusCode, validationErrors);
		return;
	} else if ((err as unknown as Record<string, unknown>).code === 11000) {
		statusCode = 409;
		const mongoErr = err as unknown as {
			keyPattern: Record<string, number>;
		};
		const field = mongoErr.keyPattern
			? Object.keys(mongoErr.keyPattern)[0] || "field"
			: "field";
		message = `Duplicate value for ${field}`;
	} else if (err instanceof JsonWebTokenError) {
		statusCode = 401;
		message = "Invalid token";
	} else if (err instanceof TokenExpiredError) {
		statusCode = 401;
		message = "Token has expired";
	} else {
		console.error("[Error]", {
			route: req.originalUrl,
			method: req.method,
			userId: req.user?.id,
			statusCode,
			error: err.message,
		});
		if (process.env.NODE_ENV !== "production") {
			message = err.message || message;
		}
	}

	ApiResponse.error(res, message, statusCode, errors);
};
