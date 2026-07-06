import mongoose, { Schema } from "mongoose";
import { deleteImage } from "../../common/utils/cloudinaryUpload";

export interface IProduct {
	_id: mongoose.Types.ObjectId;
	name: string;
	sku: string;
	category: string;
	purchasePrice: number;
	sellingPrice: number;
	stockQuantity: number;
	imageUrl: string;
	imagePublicId: string;
	createdBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
	{
		name: { type: String, required: true, trim: true },
		sku: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		category: { type: String, required: true, trim: true },
		purchasePrice: { type: Number, required: true, min: 0 },
		sellingPrice: { type: Number, required: true, min: 0 },
		stockQuantity: { type: Number, required: true, min: 0, default: 0 },
		imageUrl: { type: String, required: true },
		imagePublicId: { type: String, required: true },
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true, strict: true }
);

productSchema.index({ sku: 1 });
productSchema.index({ name: "text", sku: "text", category: "text" });

productSchema.pre(
	"deleteOne",
	{ document: true, query: false },
	async function () {
		const doc = this as unknown as IProduct;
		if (doc.imagePublicId) {
			await deleteImage(doc.imagePublicId);
		}
	}
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
