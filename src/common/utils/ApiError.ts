export class ApiError extends Error {
	statusCode: number;
	errors?: Array<{ field: string; message: string }>;
	isOperational: boolean;

	constructor(
		message: string,
		statusCode: number,
		errors?: Array<{ field: string; message: string }>
	) {
		super(message);
		this.statusCode = statusCode;
		this.errors = errors;
		this.isOperational = true;
		Object.setPrototypeOf(this, ApiError.prototype);
	}
}
