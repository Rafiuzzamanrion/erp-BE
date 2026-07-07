import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { mongoSanitize } from "./middlewares/mongoSanitize.middleware";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { notFound } from "./middlewares/notFound.middleware";

import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/users/user.route";
import roleRoutes from "./modules/roles/role.route";
import permissionRoutes from "./modules/roles/permission.route";
import categoryRoutes from "./modules/categories/category.route";
import productRoutes from "./modules/products/product.route";
import saleRoutes from "./modules/sales/sale.route";
import dashboardRoutes from "./modules/dashboard/dashboard.route";

import mongoose from "mongoose";

const app = express();

app.use(helmet());
app.use(
	cors({
		origin: env.CLIENT_URL,
		credentials: true,
	})
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);

if (env.NODE_ENV === "development") {
	app.use(
		pinoHttp({
			transport: { target: "pino-pretty", options: { colorize: true } },
		})
	);
}

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	message: {
		success: false,
		message: "Too many login attempts. Please try again after 15 minutes.",
	},
});

setupSwagger(app);

app.get("/api/v1/health", (_req, res) => {
	const dbStatus =
		mongoose.connection.readyState === 1 ? "connected" : "disconnected";
	res.json({
		success: true,
		message: "Server is running",
		data: {
			uptime: process.uptime(),
			dbStatus,
			timestamp: new Date().toISOString(),
		},
	});
});

app.use("/api/v1/auth/login", loginLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/sales", saleRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
