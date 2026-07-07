import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import * as authController from "./auth.controller";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@erp.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Admin@123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   _id: "64a1b2c3d4e5f6"
 *                   name: "Admin User"
 *                   email: "admin@erp.com"
 *                   role: "admin"
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User retrieved successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "Admin User"
 *                 email: "admin@erp.com"
 *                 role: "admin"
 *       401:
 *         description: Not authenticated or token expired
 *       404:
 *         description: User not found
 */
router.get("/me", authenticate, authController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Logged out successfully"
 *       401:
 *         description: Not authenticated
 */
router.post("/logout", authenticate, authController.logout);

export default router;
