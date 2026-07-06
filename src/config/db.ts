import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
	mongoose.set("strictQuery", true);

	mongoose.connection.on("connected", () => {
		console.log("[DB] MongoDB connected successfully");
	});

	mongoose.connection.on("error", (err) => {
		console.error("[DB] MongoDB connection error:", err.message);
		process.exit(1);
	});

	mongoose.connection.on("disconnected", () => {
		console.warn("[DB] MongoDB disconnected");
	});

	try {
		await mongoose.connect(env.MONGODB_URI, {
			maxPoolSize: 10,
			minPoolSize: 2,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});
	} catch (error) {
		console.error("[DB] Initial MongoDB connection failed:", error);
		process.exit(1);
	}
};

export const disconnectDB = async (): Promise<void> => {
	await mongoose.disconnect();
};
