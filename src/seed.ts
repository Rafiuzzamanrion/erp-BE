import mongoose from "mongoose";
import { connectDB, disconnectDB } from "./config/db";
import { User, IUser } from "./modules/users/user.model";
import { Permission, IPermission } from "./modules/roles/permission.model";
import { Role, IRole } from "./modules/roles/role.model";
import { Product } from "./modules/products/product.model";

const seed = async (): Promise<void> => {
	await connectDB();

	console.log("[Seed] Clearing existing data...");
	await User.deleteMany({});
	await Permission.deleteMany({});
	await Role.deleteMany({});
	await Product.deleteMany({});

	console.log("[Seed] Creating permissions...");
	const permDocs = await Permission.insertMany([
		{ key: "product:create", description: "Create products" },
		{ key: "product:update", description: "Update products" },
		{ key: "product:delete", description: "Delete products" },
		{ key: "product:view", description: "View products" },
		{ key: "sale:create", description: "Create sales" },
		{ key: "sale:view", description: "View sales history" },
		{ key: "user:manage", description: "Manage users" },
		{ key: "role:manage", description: "Manage roles and permissions" },
		{ key: "dashboard:view", description: "View dashboard statistics" },
	]);
	const perms = permDocs as unknown as IPermission[];
	console.log(`[Seed] Created ${perms.length} permissions`);

	const findPermId = (key: string): mongoose.Types.ObjectId | undefined => {
		const p = perms.find((perm) => perm.key === key);
		return p ? p._id : undefined;
	};

	const adminPermIds = perms.map((p) => p._id);
	const managerPermIds = [
		findPermId("product:create"),
		findPermId("product:update"),
		findPermId("product:delete"),
		findPermId("product:view"),
		findPermId("sale:create"),
		findPermId("sale:view"),
		findPermId("dashboard:view"),
	].filter(Boolean) as mongoose.Types.ObjectId[];
	const employeePermIds = [
		findPermId("product:view"),
		findPermId("sale:create"),
		findPermId("sale:view"),
		findPermId("dashboard:view"),
	].filter(Boolean) as mongoose.Types.ObjectId[];

	console.log("[Seed] Creating roles...");
	const roleDocs = await Role.insertMany([
		{ name: "Admin", permissions: adminPermIds, isSystem: true },
		{ name: "Manager", permissions: managerPermIds, isSystem: true },
		{ name: "Employee", permissions: employeePermIds, isSystem: true },
	]);
	const roles = roleDocs as unknown as IRole[];
	const adminRole = roles[0];
	console.log("[Seed] Created 3 roles");

	if (!adminRole) {
		throw new Error("Failed to create admin role");
	}

	console.log("[Seed] Creating admin user...");
	const adminUser = (await User.create({
		name: "Admin",
		email: "admin@erp.com",
		password: "Admin@123",
		role: adminRole._id,
		isActive: true,
	})) as unknown as IUser;
	console.log(`[Seed] Admin user created: ${adminUser.email}`);

	console.log("[Seed] Creating sample products...");
	const sampleProducts = [
		{ name: "Wireless Mouse", sku: "WM-001", category: "Electronics", purchasePrice: 15, sellingPrice: 29.99, stockQuantity: 50, imageUrl: "https://placehold.co/400x400?text=Wireless+Mouse", imagePublicId: "seed/wm001", createdBy: adminUser._id },
		{ name: "Mechanical Keyboard", sku: "MK-002", category: "Electronics", purchasePrice: 45, sellingPrice: 89.99, stockQuantity: 30, imageUrl: "https://placehold.co/400x400?text=Mechanical+Keyboard", imagePublicId: "seed/mk002", createdBy: adminUser._id },
		{ name: "USB-C Hub", sku: "UH-003", category: "Accessories", purchasePrice: 20, sellingPrice: 39.99, stockQuantity: 100, imageUrl: "https://placehold.co/400x400?text=USB-C+Hub", imagePublicId: "seed/uh003", createdBy: adminUser._id },
		{ name: '27" Monitor', sku: "MON-004", category: "Electronics", purchasePrice: 150, sellingPrice: 299.99, stockQuantity: 15, imageUrl: "https://placehold.co/400x400?text=27+Monitor", imagePublicId: "seed/mon004", createdBy: adminUser._id },
		{ name: "Desk Lamp", sku: "DL-005", category: "Office", purchasePrice: 12, sellingPrice: 24.99, stockQuantity: 75, imageUrl: "https://placehold.co/400x400?text=Desk+Lamp", imagePublicId: "seed/dl005", createdBy: adminUser._id },
		{ name: "Notebook", sku: "NB-006", category: "Stationery", purchasePrice: 3, sellingPrice: 7.99, stockQuantity: 200, imageUrl: "https://placehold.co/400x400?text=Notebook", imagePublicId: "seed/nb006", createdBy: adminUser._id },
		{ name: "Webcam HD", sku: "WC-007", category: "Electronics", purchasePrice: 25, sellingPrice: 49.99, stockQuantity: 3, imageUrl: "https://placehold.co/400x400?text=Webcam+HD", imagePublicId: "seed/wc007", createdBy: adminUser._id },
		{ name: "Standing Desk", sku: "SD-008", category: "Furniture", purchasePrice: 200, sellingPrice: 449.99, stockQuantity: 5, imageUrl: "https://placehold.co/400x400?text=Standing+Desk", imagePublicId: "seed/sd008", createdBy: adminUser._id },
		{ name: "Ergonomic Chair", sku: "EC-009", category: "Furniture", purchasePrice: 180, sellingPrice: 349.99, stockQuantity: 8, imageUrl: "https://placehold.co/400x400?text=Ergonomic+Chair", imagePublicId: "seed/ec009", createdBy: adminUser._id },
		{ name: "Wireless Headphones", sku: "WH-010", category: "Electronics", purchasePrice: 35, sellingPrice: 79.99, stockQuantity: 2, imageUrl: "https://placehold.co/400x400?text=Wireless+Headphones", imagePublicId: "seed/wh010", createdBy: adminUser._id },
	];

	await Product.insertMany(sampleProducts);
	console.log(`[Seed] Created ${sampleProducts.length} sample products`);

	console.log("\n========================================");
	console.log("  SEED COMPLETE");
	console.log("========================================");
	console.log("  Admin Login:");
	console.log("  Email:    admin@erp.com");
	console.log("  Password: Admin@123");
	console.log("========================================\n");

	await disconnectDB();
	process.exit(0);
};

seed().catch((err) => {
	console.error("[Seed] Error:", err);
	process.exit(1);
});
