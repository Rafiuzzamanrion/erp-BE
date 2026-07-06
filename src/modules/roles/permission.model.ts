import mongoose, { Schema, Document } from "mongoose";

export interface IPermission extends Document {
	key: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
	{
		key: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		strict: true,
	}
);

export const Permission = mongoose.model<IPermission>(
	"Permission",
	permissionSchema
);
