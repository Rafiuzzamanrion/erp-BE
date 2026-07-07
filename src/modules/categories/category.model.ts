import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		description: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
		strict: true,
	}
);

export const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
