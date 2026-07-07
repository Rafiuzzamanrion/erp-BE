import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
	createSaleSchema,
	saleQuerySchema,
	saleIdParamsSchema,
} from "./sale.schema";
import * as saleController from "./sale.controller";

const router = Router();

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "60f7b1a2c1d4e8a1b0c3d2e1"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Sale created successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 items:
 *                   - product: "60f7b1a2c1d4e8a1b0c3d2e1"
 *                     productName: "Wireless Mouse"
 *                     quantity: 2
 *                     unitPrice: 29.99
 *                     subtotal: 59.98
 *                 grandTotal: 59.98
 *                 soldBy:
 *                   _id: "64a1b2c3d4e5f6"
 *                   name: "Admin User"
 *                   email: "admin@example.com"
 *       400:
 *         description: Validation failed or insufficient stock
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Product not found
 */
router.post(
	"/",
	authenticate,
	authorize("admin", "manager", "employee"),
	validate(createSaleSchema),
	saleController.createSale
);

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales with search and pagination
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name within sale items
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (e.g. -createdAt)
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Sales retrieved successfully"
 *               data:
 *                 - _id: "64a1b2c3d4e5f6"
 *                   items:
 *                     - productName: "Wireless Mouse"
 *                       quantity: 2
 *                       subtotal: 59.98
 *                   grandTotal: 59.98
 *                   soldBy:
 *                     _id: "64a1b2c3d4e5f6"
 *                     name: "Admin User"
 *                   createdAt: "2024-01-15T10:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 25
 *                 totalPages: 3
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get(
	"/",
	authenticate,
	validate(saleQuerySchema, "query"),
	saleController.getSales
);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Get a sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Sale retrieved successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 items:
 *                   - productName: "Wireless Mouse"
 *                     quantity: 2
 *                     unitPrice: 29.99
 *                     subtotal: 59.98
 *                 grandTotal: 59.98
 *                 soldBy:
 *                   _id: "64a1b2c3d4e5f6"
 *                   name: "Admin User"
 *                 createdAt: "2024-01-15T10:00:00.000Z"
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Sale not found
 */
router.get(
	"/:id",
	authenticate,
	validate(saleIdParamsSchema, "params"),
	saleController.getSaleById
);

export default router;
