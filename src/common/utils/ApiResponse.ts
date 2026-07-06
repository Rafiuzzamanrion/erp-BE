import { Response } from "express";

export interface IApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
	meta?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	errors?: Array<{ field: string; message: string }>;
}

export class ApiResponse {
	static success<T>(
		res: Response,
		message: string,
		data?: T,
		meta?: IApiResponse["meta"],
		statusCode = 200
	): void {
		const response: IApiResponse<T> = {
			success: true,
			message,
		};
		if (data !== undefined) response.data = data;
		if (meta) response.meta = meta;
		res.status(statusCode).json(response);
	}

	static error(
		res: Response,
		message: string,
		statusCode: number,
		errors?: Array<{ field: string; message: string }>
	): void {
		const response: IApiResponse = {
			success: false,
			message,
		};
		if (errors) response.errors = errors;
		res.status(statusCode).json(response);
	}
}
