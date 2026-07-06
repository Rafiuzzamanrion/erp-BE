import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Mini ERP — Inventory & Sales Management API",
			version: "1.0.0",
			description:
				"Full API documentation for the Mini ERP system. Manage products, sales, users, roles, and dashboard statistics.",
		},
		servers: [
			{ url: "/api/v1", description: "API v1" },
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				ApiResponse: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
						data: { type: "object" },
						meta: {
							type: "object",
							properties: {
								page: { type: "integer" },
								limit: { type: "integer" },
								total: { type: "integer" },
								totalPages: { type: "integer" },
							},
						},
					},
				},
				ApiError: {
					type: "object",
					properties: {
						success: { type: "boolean", example: false },
						message: { type: "string" },
						errors: {
							type: "array",
							items: {
								type: "object",
								properties: {
									field: { type: "string" },
									message: { type: "string" },
								},
							},
						},
					},
				},
			},
		},
		security: [{ bearerAuth: [] }],
	},
	apis: ["./src/modules/**/*.route.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
	app.use(
		"/api-docs",
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec, {
			customSiteTitle: "ERP API Documentation",
		})
	);

	app.get("/api-docs.json", (_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.json(swaggerSpec);
	});
};

export default swaggerSpec;
