import request from "supertest";
import app from "../../../app";
import mongoose from "mongoose";
import { User } from "../../users/user.model";
import { Product } from "../product.model";
import { Role } from "../../roles/role.model";
import { Category } from "../../categories/category.model";

const testEmail = "test-product@test.com";
const testPassword = "Test123456";
const testCategory = "test";
let authToken = "";

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
}, 30000);

afterAll(async () => {
	await Product.deleteMany({ sku: "TST-001" });
	await Product.deleteMany({ sku: "TST-002" });
	await Category.deleteMany({ name: testCategory });
	await User.deleteMany({ email: testEmail });
	await mongoose.disconnect();
}, 30000);

beforeEach(async () => {
	await Product.deleteMany({ sku: "TST-001" });
	await Product.deleteMany({ sku: "TST-002" });
});

describe("POST /api/v1/products", () => {
	it("should create product with valid data + image", async () => {
		const testImageBuffer = Buffer.from("fake-image-data");
		const res = await request(app)
			.post("/api/v1/products")
			.set("Authorization", `Bearer ${authToken}`)
			.field("name", "Test Product")
			.field("sku", "TST-001")
			.field("category", "Test")
			.field("purchasePrice", "10")
			.field("sellingPrice", "20")
			.field("stockQuantity", "100")
			.attach("image", testImageBuffer, "test.jpg");

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toHaveProperty("sku", "TST-001");
	});

	it("should reject product creation without image (400)", async () => {
		const res = await request(app)
			.post("/api/v1/products")
			.set("Authorization", `Bearer ${authToken}`)
			.field("name", "No Image Product")
			.field("sku", "TST-002")
			.field("category", "Test")
			.field("purchasePrice", "10")
			.field("sellingPrice", "20")
			.field("stockQuantity", "50");

		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
	});

	it("should reject duplicate SKU (409)", async () => {
		const testImageBuffer = Buffer.from("fake-image-data");

		await request(app)
			.post("/api/v1/products")
			.set("Authorization", `Bearer ${authToken}`)
			.field("name", "First Product")
			.field("sku", "TST-001")
			.field("category", "Test")
			.field("purchasePrice", "10")
			.field("sellingPrice", "20")
			.field("stockQuantity", "100")
			.attach("image", testImageBuffer, "test.jpg");

		const res = await request(app)
			.post("/api/v1/products")
			.set("Authorization", `Bearer ${authToken}`)
			.field("name", "Duplicate Product")
			.field("sku", "TST-001")
			.field("category", "Test")
			.field("purchasePrice", "15")
			.field("sellingPrice", "25")
			.field("stockQuantity", "50")
			.attach("image", testImageBuffer, "test.jpg");

		expect(res.status).toBe(409);
		expect(res.body.success).toBe(false);
	});
});
