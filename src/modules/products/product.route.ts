import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { upload } from "../../middlewares/upload.middleware";
import * as productController from "./product.controller";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, sku, category, purchasePrice, sellingPrice, image]
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               category:
 *                 type: string
 *               purchasePrice:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product created successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "Wireless Mouse"
 *                 sku: "WM-001"
 *                 category: "electronics"
 *                 purchasePrice: 15.00
 *                 sellingPrice: 29.99
 *                 stockQuantity: 100
 *                 imageUrl: "https://res.cloudinary.com/..."
 *       400:
 *         description: Validation error or missing image
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: SKU already exists
 */
router.post(
	"/",
	authorize("admin", "manager"),
	upload.single("image"),
	productController.createProduct
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with search, filter, sort, pagination
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, SKU, or category
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
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
 *         description: Sort field (e.g. -createdAt, name, -sellingPrice)
 *     responses:
 *       200:
 *         description: Products list with pagination meta
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Products retrieved successfully"
 *               data:
 *                 - _id: "64a1b2c3d4e5f6"
 *                   name: "Wireless Mouse"
 *                   sku: "WM-001"
 *                   category: "electronics"
 *                   sellingPrice: 29.99
 *                   stockQuantity: 100
 *                   imageUrl: "https://res.cloudinary.com/..."
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
router.get("/", productController.getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product fetched successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "Wireless Mouse"
 *                 sku: "WM-001"
 *                 category: "electronics"
 *                 purchasePrice: 15.00
 *                 sellingPrice: 29.99
 *                 stockQuantity: 100
 *                 imageUrl: "https://res.cloudinary.com/..."
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Product not found
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               category:
 *                 type: string
 *               purchasePrice:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product updated successfully"
 *               data:
 *                 _id: "64a1b2c3d4e5f6"
 *                 name: "Wireless Mouse Pro"
 *                 sku: "WM-001"
 *                 category: "electronics"
 *                 sellingPrice: 39.99
 *                 stockQuantity: 80
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Product not found
 *       409:
 *         description: SKU already exists
 */
router.put(
	"/:id",
	authorize("admin", "manager"),
	upload.single("image"),
	productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product deleted successfully"
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Product not found
 */
router.delete(
	"/:id",
	authorize("admin", "manager"),
	productController.deleteProduct
);

export default router;
