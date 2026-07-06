import request from "supertest";
import app from "../../../app";
import mongoose from "mongoose";
import { User } from "../../users/user.model";

const testEmail = "test-login@test-auth.com";
const testPassword = "Test123456";

beforeAll(async () => {
	const mongoUri =
		process.env.MONGODB_URI || "mongodb://localhost:27017/erp-test";
	await mongoose.connect(mongoUri);
	await User.deleteMany({ email: testEmail });
	await User.create({
		name: "Test User",
		email: testEmail,
		password: testPassword,
		role: null,
		isActive: true,
	});
}, 30000);

afterAll(async () => {
	await User.deleteMany({ email: testEmail });
	await mongoose.disconnect();
}, 30000);

describe("POST /api/v1/auth/login", () => {
	it("should login successfully with valid credentials", async () => {
		const res = await request(app)
			.post("/api/v1/auth/login")
			.send({ email: testEmail, password: testPassword });

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toHaveProperty("token");
		expect(res.body.data.user.email).toBe(testEmail);
	});

	it("should fail with wrong password (401)", async () => {
		const res = await request(app)
			.post("/api/v1/auth/login")
			.send({ email: testEmail, password: "wrong-password" });

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
	});

	it("should fail with non-existent email (401)", async () => {
		const res = await request(app)
			.post("/api/v1/auth/login")
			.send({ email: "nonexistent@test.com", password: testPassword });

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
	});
});
