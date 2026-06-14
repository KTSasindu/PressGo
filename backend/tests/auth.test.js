import bcrypt from "bcryptjs";
import { jest } from "@jest/globals";
import request from "supertest";
import { createMockPrisma } from "./helpers/mockPrisma.js";
import { TEST_JWT_SECRET } from "./helpers/auth.js";

const mockPrisma = createMockPrisma();

jest.unstable_mockModule("../src/config/prisma.js", () => ({
  default: mockPrisma,
}));

const { default: app } = await import("../src/server.js");

describe("Authentication routes", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Covers the happy path for account creation.
  it("registers a valid user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockImplementation(async ({ data }) => ({
      id: 10,
      ...data,
      createdAt: new Date("2026-01-01T10:00:00.000Z"),
      updatedAt: new Date("2026-01-01T10:00:00.000Z"),
    }));

    const response = await request(app).post("/api/auth/register").send({
      name: "New Customer",
      email: "new@pressgo.com",
      phone: "0771234567",
      password: "123456",
      role: "CUSTOMER",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.user.email).toBe("new@pressgo.com");
    expect(response.body.user.password).toBeUndefined();
  });

  // Ensures request validation blocks malformed registration payloads.
  it("rejects an invalid register request", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "wrongemail",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // Confirms duplicate email protection before user creation runs.
  it("rejects duplicate email registration", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "existing@pressgo.com",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Existing User",
      email: "existing@pressgo.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  // Verifies valid credentials return a token and a sanitized user object.
  it("logs in with valid credentials", async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 2,
      name: "Admin User",
      email: "admin@pressgo.com",
      phone: "0711111111",
      role: "ADMIN",
      password: hashedPassword,
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "admin@pressgo.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.password).toBeUndefined();
  });

  // Makes sure wrong passwords are rejected even when the user exists.
  it("rejects an invalid password", async () => {
    const hashedPassword = await bcrypt.hash("correct-password", 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 3,
      email: "customer@pressgo.com",
      role: "CUSTOMER",
      password: hashedPassword,
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "customer@pressgo.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid credentials");
  });

  // Guards the login endpoint against missing required fields.
  it("rejects login requests with missing fields", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@pressgo.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });
});
