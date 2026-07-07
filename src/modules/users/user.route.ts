import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import * as userController from "./user.controller";

const router = Router();

router.use(authenticate, authorize("admin"));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Users retrieved successfully"
 *               data:
 *                 - _id: "64a1b2c3d4e5f6"
 *                   name: "Admin User"
 *                   email: "admin@erp.com"
 *                   role: "admin"
 *                   isActive: true
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get("/", userController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *                 isActive: true
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get("/:id", userController.getUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, employee]
 *                 example: "employee"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User created successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 role: "employee"
 *                 isActive: true
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Email already exists
 */
router.post("/", userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.updated@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [admin, manager, employee]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User updated successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "John Updated"
 *                 email: "john.updated@example.com"
 *                 role: "employee"
 *                 isActive: true
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put("/:id", userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User deleted successfully"
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete("/:id", userController.deleteUser);

export default router;
