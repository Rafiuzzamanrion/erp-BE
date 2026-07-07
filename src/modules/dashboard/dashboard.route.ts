import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { dashboardQuerySchema } from "./dashboard.schema";
import * as dashboardController from "./dashboard.controller";

const router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter for total revenue/sales (ISO format, e.g. 2024-01-01)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter for total revenue/sales (ISO format, e.g. 2024-01-31)
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Dashboard stats retrieved successfully"
 *               data:
 *                 totalProducts: 150
 *                 totalSales: 42
 *                 lowStockProducts:
 *                   - _id: "64a1b2c3d4e5f6"
 *                     name: "Wireless Mouse"
 *                     sku: "WM-001"
 *                     stockQuantity: 3
 *                 lowStockCount: 5
 *                 totalRevenue: 12599.50
 *                 recentSales:
 *                   - _id: "64a1b2c3d4e5f6"
 *                     grandTotal: 59.98
 *                     createdAt: "2024-01-15T10:00:00.000Z"
 *                     soldBy:
 *                       _id: "64a1b2c3d4e5f6"
 *                       name: "Admin User"
 *                     items:
 *                       - productName: "Wireless Mouse"
 *                         quantity: 2
 *                         subtotal: 59.98
 *                 dailyRevenue:
 *                   - date: "2024-01-15"
 *                     revenue: 359.90
 *                     sales: 6
 *                 categoryRevenue:
 *                   - category: "Wireless Mouse"
 *                     revenue: 899.75
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get(
	"/stats",
	authenticate,
	validate(dashboardQuerySchema, "query"),
	dashboardController.getStats
);

export default router;
