import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env } from "./config/env";
import jwt from "jsonwebtoken";

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: env.CLIENT_URL,
		methods: ["GET", "POST"],
	},
});

io.use((socket, next) => {
	const token = (socket.handshake.auth as Record<string, unknown>).token as string | undefined;
	if (!token) {
		return next(new Error("Authentication required"));
	}
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as {
			id: string;
			role: string;
		};
		socket.data.userId = decoded.id;
		socket.data.userRole = decoded.role;
		next();
	} catch {
		next(new Error("Invalid token"));
	}
});

io.on("connection", (socket) => {
	console.log(`[Socket.IO] Client connected: ${socket.id}`);
	socket.on("disconnect", () => {
		console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
	});
});

export { io };

const gracefulShutdown = async (): Promise<void> => {
	console.log("\n[Server] Shutting down gracefully...");
	httpServer.close(() => {
		console.log("[Server] HTTP server closed");
	});
	await io.close();
	await disconnectDB();
	process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

const start = async (): Promise<void> => {
	await connectDB();
	httpServer.listen(env.PORT, () => {
		console.log(
			`[Server] Running on port ${env.PORT} in ${env.NODE_ENV} mode`
		);
		console.log(
			`[Server] Swagger docs: http://localhost:${env.PORT}/api-docs`
		);
	});
};

start();
