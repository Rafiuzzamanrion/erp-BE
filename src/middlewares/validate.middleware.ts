import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ApiError } from "../common/utils/ApiError";

type ValidationSource = "body" | "params" | "query";

export const validate = (
	schema: ZodSchema,
	source: ValidationSource = "body"
) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			const errors = result.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			}));
			return next(new ApiError("Validation failed", 400, errors));
		}

		if (source === "body") {
			req.body = result.data;
		} else if (source === "params") {
			(req as unknown as Record<string, unknown>).params = result.data;
		} else if (source === "query") {
			(req as unknown as Record<string, unknown>).query = result.data;
		}
		next();
	};
};
