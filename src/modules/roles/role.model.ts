import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRole extends Document {
	name: string;
	permissions: Types.ObjectId[];
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		permissions: [
			{
				type: Schema.Types.ObjectId,
				ref: "Permission",
			},
		],
		isSystem: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		strict: true,
	}
);

export const Role = mongoose.model<IRole>("Role", roleSchema);
