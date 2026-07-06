import cloudinary from "../../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export const uploadImage = (
	buffer: Buffer,
	folder: string
): Promise<{ secure_url: string; public_id: string }> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{ folder, resource_type: "image" },
			(error: Error | undefined, result: UploadApiResponse | undefined) => {
				if (error) {
					reject(error);
				} else if (result) {
					resolve({
						secure_url: result.secure_url,
						public_id: result.public_id,
					});
				} else {
					reject(new Error("Cloudinary upload returned no result"));
				}
			}
		);
		uploadStream.end(buffer);
	});
};

export const deleteImage = async (publicId: string): Promise<void> => {
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.warn("[Cloudinary] Failed to delete image:", publicId, error);
	}
};
