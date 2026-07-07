import mongoose from "mongoose";
import { connectDB, disconnectDB } from "./config/db";
import { User, IUser } from "./modules/users/user.model";
import { Permission, IPermission } from "./modules/roles/permission.model";
import { Role, IRole } from "./modules/roles/role.model";
import { Product } from "./modules/products/product.model";
import { Sale } from "./modules/sales/sale.model";
import { Category } from "./modules/categories/category.model";

const seed = async (): Promise<void> => {
	await connectDB();

	console.log("[Seed] Clearing existing data...");
	await User.deleteMany({});
	await Permission.deleteMany({});
	await Role.deleteMany({});
	await Category.deleteMany({});
	await Product.deleteMany({});
	await Sale.deleteMany({});

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
		{ name: "admin", permissions: adminPermIds, isSystem: true },
		{ name: "manager", permissions: managerPermIds, isSystem: true },
		{ name: "employee", permissions: employeePermIds, isSystem: true },
	]);
	const roles = roleDocs as unknown as IRole[];
	const adminRole = roles[0]!;
	const managerRole = roles[1]!;
	const employeeRole = roles[2]!;
	console.log("[Seed] Created 3 roles");

	console.log("[Seed] Creating admin user...");
	const adminUser = (await User.create({
		name: "Admin User",
		email: "admin@erp.com",
		password: "Admin@123",
		role: adminRole._id,
		isActive: true,
	})) as unknown as IUser;
	console.log(`[Seed] Admin user created: ${adminUser.email}`);

	console.log("[Seed] Creating manager user...");
	const managerUser = (await User.create({
		name: "Manager User",
		email: "manager@erp.com",
		password: "Manager@123",
		role: managerRole._id,
		isActive: true,
	})) as unknown as IUser;
	console.log(`[Seed] Manager user created: ${managerUser.email}`);

	console.log("[Seed] Creating employee user...");
	const employeeUser = (await User.create({
		name: "Employee User",
		email: "employee@erp.com",
		password: "Employee@123",
		role: employeeRole._id,
		isActive: true,
	})) as unknown as IUser;
	console.log(`[Seed] Employee user created: ${employeeUser.email}`);

	console.log("[Seed] Creating categories...");
	const categoryDocs = await Category.insertMany([
		{ name: "electronics", description: "Electronic devices and accessories" },
		{ name: "accessories", description: "Computer and mobile accessories" },
		{ name: "office", description: "Office supplies and equipment" },
		{ name: "stationery", description: "Stationery items" },
		{ name: "furniture", description: "Office furniture" },
	]);
	const categoryNames = categoryDocs.map((c) => c.name);
	console.log(
		`[Seed] Created ${categoryDocs.length} categories: ${categoryNames.join(", ")}`
	);

	console.log("[Seed] Creating sample products...");
	const sampleProducts = [
		{
			name: "Wireless Mouse",
			sku: "WM-001",
			category: "electronics",
			purchasePrice: 15,
			sellingPrice: 29.99,
			stockQuantity: 50,
			imageUrl: "https://placehold.co/400x400?text=Wireless+Mouse",
			imagePublicId: "seed/wm001",
			createdBy: adminUser._id,
		},
		{
			name: "Mechanical Keyboard",
			sku: "MK-002",
			category: "electronics",
			purchasePrice: 45,
			sellingPrice: 89.99,
			stockQuantity: 30,
			imageUrl: "https://placehold.co/400x400?text=Mechanical+Keyboard",
			imagePublicId: "seed/mk002",
			createdBy: adminUser._id,
		},
		{
			name: "USB-C Hub",
			sku: "UH-003",
			category: "accessories",
			purchasePrice: 20,
			sellingPrice: 39.99,
			stockQuantity: 100,
			imageUrl: "https://placehold.co/400x400?text=USB-C+Hub",
			imagePublicId: "seed/uh003",
			createdBy: adminUser._id,
		},
		{
			name: '27" Monitor',
			sku: "MON-004",
			category: "electronics",
			purchasePrice: 150,
			sellingPrice: 299.99,
			stockQuantity: 15,
			imageUrl: "https://placehold.co/400x400?text=27+Monitor",
			imagePublicId: "seed/mon004",
			createdBy: adminUser._id,
		},
		{
			name: "Desk Lamp",
			sku: "DL-005",
			category: "office",
			purchasePrice: 12,
			sellingPrice: 24.99,
			stockQuantity: 75,
			imageUrl: "https://placehold.co/400x400?text=Desk+Lamp",
			imagePublicId: "seed/dl005",
			createdBy: adminUser._id,
		},
		{
			name: "Notebook",
			sku: "NB-006",
			category: "stationery",
			purchasePrice: 3,
			sellingPrice: 7.99,
			stockQuantity: 200,
			imageUrl: "https://placehold.co/400x400?text=Notebook",
			imagePublicId: "seed/nb006",
			createdBy: adminUser._id,
		},
		{
			name: "Webcam HD",
			sku: "WC-007",
			category: "electronics",
			purchasePrice: 25,
			sellingPrice: 49.99,
			stockQuantity: 3,
			imageUrl: "https://placehold.co/400x400?text=Webcam+HD",
			imagePublicId: "seed/wc007",
			createdBy: adminUser._id,
		},
		{
			name: "Standing Desk",
			sku: "SD-008",
			category: "furniture",
			purchasePrice: 200,
			sellingPrice: 449.99,
			stockQuantity: 5,
			imageUrl: "https://placehold.co/400x400?text=Standing+Desk",
			imagePublicId: "seed/sd008",
			createdBy: adminUser._id,
		},
		{
			name: "Ergonomic Chair",
			sku: "EC-009",
			category: "furniture",
			purchasePrice: 180,
			sellingPrice: 349.99,
			stockQuantity: 8,
			imageUrl: "https://placehold.co/400x400?text=Ergonomic+Chair",
			imagePublicId: "seed/ec009",
			createdBy: adminUser._id,
		},
		{
			name: "Wireless Headphones",
			sku: "WH-010",
			category: "electronics",
			purchasePrice: 35,
			sellingPrice: 79.99,
			stockQuantity: 2,
			imageUrl: "https://placehold.co/400x400?text=Wireless+Headphones",
			imagePublicId: "seed/wh010",
			createdBy: adminUser._id,
		},
	];

	await Product.insertMany(sampleProducts);
	console.log(`[Seed] Created ${sampleProducts.length} sample products`);

	console.log("[Seed] Creating sample sales...");
	const products = await Product.find().lean();

	const adminDoc = await User.findOne({ email: "admin@erp.com" }).lean();
	const managerDoc = await User.findOne({ email: "manager@erp.com" }).lean();
	const employeeDoc = await User.findOne({ email: "employee@erp.com" }).lean();

	const sellers = [adminDoc, managerDoc, employeeDoc].filter(
		Boolean
	) as IUser[];

	const sampleSales = [];
	for (let i = 0; i < 30; i++) {
		const numItems = Math.floor(Math.random() * 3) + 1;
		const saleItems = [];
		let grandTotal = 0;
		const usedProductIds = new Set<string>();

		for (let j = 0; j < numItems; j++) {
			const availableProducts = products.filter(
				(p) => !usedProductIds.has(String(p._id))
			);
			const product =
				availableProducts[Math.floor(Math.random() * availableProducts.length)];
			if (!product) continue;
			usedProductIds.add(String(product._id));
			const quantity = Math.floor(Math.random() * 3) + 1;
			const subtotal = Number((product.sellingPrice * quantity).toFixed(2));
			grandTotal += subtotal;
			saleItems.push({
				product: product._id,
				productName: product.name,
				quantity,
				unitPrice: product.sellingPrice,
				subtotal,
			});
		}

		const daysAgo = Math.floor(Math.random() * 7);
		const createdAt = new Date();
		createdAt.setDate(createdAt.getDate() - daysAgo);
		createdAt.setHours(
			Math.floor(Math.random() * 14) + 8,
			Math.floor(Math.random() * 60)
		);

		const seller = sellers[Math.floor(Math.random() * sellers.length)];
		if (!seller) continue;

		sampleSales.push({
			items: saleItems,
			grandTotal: Number(grandTotal.toFixed(2)),
			soldBy: seller._id,
			createdAt,
		});
	}

	await Sale.insertMany(sampleSales);
	console.log(`[Seed] Created ${sampleSales.length} sample sales`);

	console.log("\n==========================================");
	console.log("            SEED COMPLETE");
	console.log("==========================================");
	console.log(`  Admin     ID: ${adminUser._id.toString()}`);
	console.log(`            Email: admin@erp.com`);
	console.log(`            Password: Admin@123`);
	console.log("------------------------------------------");
	console.log(`  Manager   ID: ${managerUser._id.toString()}`);
	console.log(`            Email: manager@erp.com`);
	console.log(`            Password: Manager@123`);
	console.log("------------------------------------------");
	console.log(`  Employee  ID: ${employeeUser._id.toString()}`);
	console.log(`            Email: employee@erp.com`);
	console.log(`            Password: Employee@123`);
	console.log("==========================================\n");

	await disconnectDB();
	process.exit(0);
};

seed().catch((err) => {
	console.error("[Seed] Error:", err);
	process.exit(1);
});
