import { Request, Response, NextFunction } from "express";

const hasDollarPrefix = (obj: unknown): boolean => {
	if (typeof obj !== "object" || obj === null) return false;
	for (const key of Object.keys(obj as Record<string, unknown>)) {
		if (key.startsWith("$")) return true;
		if (hasDollarPrefix((obj as Record<string, unknown>)[key])) return true;
	}
	return false;
};

const sanitize = (obj: unknown): unknown => {
	if (typeof obj !== "object" || obj === null) return obj;
	if (Array.isArray(obj)) return obj.map(sanitize);

	const sanitized: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
		if (key.startsWith("$")) continue;
		sanitized[key] = sanitize(value);
	}
	return sanitized;
};

export const mongoSanitize = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	if (req.body && hasDollarPrefix(req.body)) {
		req.body = sanitize(req.body);
	}
	if (req.params && hasDollarPrefix(req.params)) {
		req.params = sanitize(req.params) as Record<string, string>;
	}
	next();
};
