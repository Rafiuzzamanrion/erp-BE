import request from "supertest";
import app from "../../../app";
import mongoose from "mongoose";
import { User } from "../../users/user.model";
import { Product } from "../../products/product.model";
import { Sale } from "../sale.model";
import { Role } from "../../roles/role.model";
import { Category } from "../../categories/category.model";

const testEmail = "test-sales@test.com";
const testPassword = "Test123456";
const testCategory = "test";
let authToken = "";
let testProductId = "";

jest.mock("../../../common/utils/cloudinaryUpload", () => ({
	uploadImage: jest.fn().mockResolvedValue({
		secure_url: "https://mock.cloudinary.com/test.jpg",
		public_id: "test-public-id",
	}),
	deleteImage: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
	const mongoUri =
		process.env.MONGODB_URI || "mongodb://localhost:27017/erp-test";
	await mongoose.connect(mongoUri);

	await User.deleteMany({ email: testEmail });
	await Category.deleteMany({ name: testCategory });
	await Category.create({ name: testCategory });

	const adminRole = await Role.findOne({ name: "admin" });
	await User.create({
		name: "Test User",
		email: testEmail,
		password: testPassword,
		role: adminRole?._id ?? null,
		isActive: true,
	});

	const loginRes = await request(app)
		.post("/api/v1/auth/login")
		.send({ email: testEmail, password: testPassword });
	authToken = loginRes.body.data.token;

	const testImageBuffer = Buffer.from("fake-image-data");
	const productRes = await request(app)
		.post("/api/v1/products")
		.set("Authorization", `Bearer ${authToken}`)
		.field("name", "Test Sale Product")
		.field("sku", "TST-SALE-001")
		.field("category", "Test")
		.field("purchasePrice", "10")
		.field("sellingPrice", "50")
		.field("stockQuantity", "10")
		.attach("image", testImageBuffer, "test.jpg");
	testProductId = productRes.body.data._id;
}, 30000);

afterAll(async () => {
	await Sale.deleteMany({});
	await Product.deleteMany({ sku: "TST-SALE-001" });
	await Category.deleteMany({ name: testCategory });
	await User.deleteMany({ email: testEmail });
	await mongoose.disconnect();
}, 30000);

describe("POST /api/v1/sales", () => {
	it("should create a sale successfully", async () => {
		const res = await request(app)
			.post("/api/v1/sales")
			.set("Authorization", `Bearer ${authToken}`)
			.send({
				items: [{ productId: testProductId, quantity: 3 }],
			});

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toHaveProperty("grandTotal");
		expect(res.body.data.grandTotal).toBe(150);

		const updatedProduct = await Product.findById(testProductId);
		expect(updatedProduct?.stockQuantity).toBe(7);
	});

	it("should reject sale with insufficient stock (400)", async () => {
		const currentStock =
			(await Product.findById(testProductId))?.stockQuantity ?? 7;

		const res = await request(app)
			.post("/api/v1/sales")
			.set("Authorization", `Bearer ${authToken}`)
			.send({
				items: [{ productId: testProductId, quantity: 100 }],
			});

		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);

		const product = await Product.findById(testProductId);
		expect(product?.stockQuantity).toBe(currentStock);
	});
});
