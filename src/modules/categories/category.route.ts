import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
	createCategorySchema,
	updateCategorySchema,
	categoryIdParamsSchema,
	categoryQuerySchema,
} from "./category.schema";
import * as categoryController from "./category.controller";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories with search and pagination
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
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
 *         description: Sort field (e.g. name, -name, createdAt, -createdAt)
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Categories fetched successfully"
 *               data:
 *                 - _id: "64a1b2c3d4e5f6"
 *                   name: "electronics"
 *                   description: "Electronic devices"
 *                   createdAt: "2024-01-15T10:00:00.000Z"
 *                   updatedAt: "2024-01-15T10:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 5
 *                 totalPages: 1
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get(
	"/",
	validate(categoryQuerySchema, "query"),
	categoryController.getCategories
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Category fetched successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "electronics"
 *                 description: "Electronic devices"
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.get(
	"/:id",
	validate(categoryIdParamsSchema, "params"),
	categoryController.getCategory
);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "electronics"
 *               description:
 *                 type: string
 *                 example: "Electronic devices"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Category created successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "electronics"
 *                 description: "Electronic devices"
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Category with this name already exists
 */
router.post(
	"/",
	authorize("admin", "manager"),
	validate(createCategorySchema),
	categoryController.createCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "electronics-updated"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Category updated successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "electronics-updated"
 *                 description: "Updated description"
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category with this name already exists
 */
router.put(
	"/:id",
	authorize("admin", "manager"),
	validate(categoryIdParamsSchema, "params"),
	validate(updateCategorySchema),
	categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Category deleted successfully"
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 *       409:
 *         description: Cannot delete category — still used by products
 */
router.delete(
	"/:id",
	authorize("admin"),
	validate(categoryIdParamsSchema, "params"),
	categoryController.deleteCategory
);

export default router;
