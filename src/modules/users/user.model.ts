import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
	_id: mongoose.Types.ObjectId;
	name: string;
	email: string;
	password: string;
	role: mongoose.Types.ObjectId | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true, select: false, minlength: 6 },
		role: {
			type: Schema.Types.ObjectId,
			ref: "Role",
			default: null,
		},
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true, strict: true }
);

userSchema.pre("save", async function () {
	if (this.isModified("password")) {
		this.set("password", await bcrypt.hash(this.get("password"), 12));
	}
});

export const User = mongoose.model<IUser>("User", userSchema);
