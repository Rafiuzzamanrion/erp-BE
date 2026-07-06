import multer from "multer";
import { Request } from "express";
import { ApiError } from "../common/utils/ApiError";
import { HTTP_STATUS } from "../common/constants/httpStatus.constant";

const ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
): void => {
	if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new ApiError(
				"Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
				HTTP_STATUS.BAD_REQUEST
			)
		);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: MAX_FILE_SIZE,
	},
});
