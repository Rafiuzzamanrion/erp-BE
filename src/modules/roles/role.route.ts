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
 *     tags: [Roles]
 *     summary: Create a new role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               isSystem:
 *                 type: boolean
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
 *                 name: "manager"
 *                 permissions: []
 *                 isSystem: false
 */
router.post("/", validate(createRoleSchema), roleController.createRole);

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
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
 *               data: []
 */
router.get("/", roleController.getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get a role by ID
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
 */
router.get("/:id", roleController.getRole);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update a role
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
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               isSystem:
 *                 type: boolean
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
 *                 name: "manager"
 *                 permissions: []
 *                 isSystem: false
 */
router.put("/:id", validate(updateRoleSchema), roleController.updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete a role
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
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Role deleted successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "manager"
 */
router.delete("/:id", roleController.deleteRole);

export default router;

