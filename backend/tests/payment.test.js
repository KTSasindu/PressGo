import { jest } from "@jest/globals";
import request from "supertest";
import { createAuthToken, TEST_JWT_SECRET } from "./helpers/auth.js";
import { createMockPrisma } from "./helpers/mockPrisma.js";

const mockPrisma = createMockPrisma();

jest.unstable_mockModule("../src/config/prisma.js", () => ({
  default: mockPrisma,
}));

const { default: app } = await import("../src/server.js");

describe("Payment routes", () => {
  const adminToken = () => createAuthToken({ id: 1, role: "ADMIN" });

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verifies the admin payment list endpoint returns platform payment records.
  it("fetches payments for admins", async () => {
    mockPrisma.payment.findMany.mockResolvedValue([
      {
        id: 8,
        orderId: 14,
        method: "CASH",
        amount: 1100,
        status: "PAID",
        order: {
          customer: { id: 3, name: "Kithsiri" },
          laundryShop: { id: 1, name: "Fresh Wash Laundry" },
        },
      },
    ]);

    const response = await request(app)
      .get("/api/payments/admin/all")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.payments).toHaveLength(1);
    expect(response.body.payments[0].status).toBe("PAID");
  });

  // Ensures invalid payment payloads fail validation before the controller runs.
  it("rejects invalid payment creation payloads", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({
        orderId: 1,
        method: "CA",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // Confirms the payment admin endpoints require authentication.
  it("rejects unauthorized access to payment endpoints", async () => {
    const response = await request(app).get("/api/payments/admin/all");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});
