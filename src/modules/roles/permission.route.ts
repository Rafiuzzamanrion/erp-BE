import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
	createPermissionSchema,
	updatePermissionSchema,
	permissionIdParamsSchema,
} from "./permission.schema";
import * as permissionController from "./permission.controller";

const router = Router();

router.use(authenticate, authorize("admin"));

/**
 * @swagger
 * /permissions:
 *   post:
 *     tags: [Permissions]
 *     summary: Create a new permission
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - description
 *             properties:
 *               key:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Permission created successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 key: "product:create"
 *                 description: "Create products"
 */
router.post(
	"/",
	validate(createPermissionSchema),
	permissionController.createPermission
);

/**
 * @swagger
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: Get all permissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Permissions fetched successfully"
 *               data: []
 */
router.get("/", permissionController.getPermissions);

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     tags: [Permissions]
 *     summary: Get a permission by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Permission fetched successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 key: "product:create"
 *                 description: "Create products"
 */
router.get(
	"/:id",
	validate(permissionIdParamsSchema, "params"),
	permissionController.getPermission
);

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     tags: [Permissions]
 *     summary: Update a permission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Permission updated successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 key: "product:create"
 *                 description: "Create products"
 */
router.put(
	"/:id",
	validate(permissionIdParamsSchema, "params"),
	validate(updatePermissionSchema),
	permissionController.updatePermission
);

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     tags: [Permissions]
 *     summary: Delete a permission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Permission deleted successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 key: "product:create"
 */
router.delete(
	"/:id",
	validate(permissionIdParamsSchema, "params"),
	permissionController.deletePermission
);

export default router;
