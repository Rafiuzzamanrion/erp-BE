import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createSaleSchema, saleQuerySchema, saleIdParamsSchema } from "./sale.schema";
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
 *       400:
 *         description: Validation failed or insufficient stock
 *       401:
 *         description: Access denied
 *       403:
 *         description: Forbidden
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
 *     summary: Get all sales with pagination
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       401:
 *         description: Access denied
 */
router.get(
  "/",
  authenticate,
  validate(saleQuerySchema, "query"),
  saleController.getSales
);

/**
 * @swagger
 * /api/v1/sales/{id}:
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
 *       401:
 *         description: Access denied
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

