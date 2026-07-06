import { Request, Response, NextFunction } from "express";
import { ApiError } from "../common/utils/ApiError";
import { HTTP_STATUS } from "../common/constants/httpStatus.constant";

export const notFound = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	next(
		new ApiError(
			`Route not found: ${req.method} ${req.originalUrl}`,
			HTTP_STATUS.NOT_FOUND
		)
	);
};
