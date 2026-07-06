import jwt from "jsonwebtoken";
import { env } from "../../config/env";

interface TokenPayload {
	id: string;
	role: string;
}

export const generateToken = (payload: TokenPayload): string => {
	return jwt.sign(payload, env.JWT_SECRET, {
		expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
	});
};
