import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createRoleSchema, updateRoleSchema } from "./role.schema";
import * as roleController from "./role.controller";

const router = Router();

router.use(authenticate, authorize("admin"));

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
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
 *                 example: "editor"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64a1b2c3d4e5f6"]
 *               isSystem:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Role created successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "editor"
 *                 permissions: []
 *                 isSystem: false
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Role with this name already exists
 */
router.post("/", validate(createRoleSchema), roleController.createRole);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Roles fetched successfully"
 *               data:
 *                 - _id: "64a1b2c3d4e5f6"
 *                   name: "admin"
 *                   permissions:
 *                     - _id: "64a1b2c3d4e5f6"
 *                       key: "dashboard:view"
 *                       description: "View dashboard statistics"
 *                   isSystem: true
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get("/", roleController.getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Role fetched successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "admin"
 *                 permissions: []
 *                 isSystem: true
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.get("/:id", roleController.getRole);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "editor-updated"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64a1b2c3d4e5f6"]
 *               isSystem:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Role updated successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "editor-updated"
 *                 permissions: []
 *                 isSystem: false
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role with this name already exists
 */
router.put("/:id", validate(updateRoleSchema), roleController.updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Role deleted successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "editor"
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.delete("/:id", roleController.deleteRole);

export default router;
