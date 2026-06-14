import { jest } from "@jest/globals";
import request from "supertest";
import { createAuthToken, TEST_JWT_SECRET } from "./helpers/auth.js";
import { createMockPrisma } from "./helpers/mockPrisma.js";

const mockPrisma = createMockPrisma();

jest.unstable_mockModule("../src/config/prisma.js", () => ({
  default: mockPrisma,
}));

const { default: app } = await import("../src/server.js");

describe("Admin routes", () => {
  const adminToken = () => createAuthToken({ id: 1, role: "ADMIN" });
  const customerToken = () => createAuthToken({ id: 7, role: "CUSTOMER" });

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Covers the aggregated analytics endpoint that powers the admin dashboard.
  it("returns dashboard stats for admins", async () => {
    mockPrisma.user.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    mockPrisma.laundryShop.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    mockPrisma.order.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    mockPrisma.payment.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    mockPrisma.review.findMany.mockResolvedValue([{ rating: 5 }]);
    mockPrisma.payment.aggregate.mockResolvedValue({
      _sum: { amount: 1100 },
    });
    mockPrisma.commission.aggregate
      .mockResolvedValueOnce({ _sum: { platformAmount: 110 } })
      .mockResolvedValueOnce({ _sum: { laundryShopAmount: 990 } });

    const response = await request(app)
      .get("/api/admin/dashboard-stats")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.stats.totalUsers).toBe(4);
    expect(response.body.stats.totalRevenue).toBe(1100);
  });

  // Verifies the recent-orders admin monitoring endpoint.
  it("returns recent orders for admins", async () => {
    mockPrisma.order.findMany.mockResolvedValue([
      {
        id: 1,
        customer: { id: 7, name: "Kithsiri", phone: "0771234567" },
        laundryShop: { id: 1, name: "Fresh Wash Laundry" },
      },
    ]);

    const response = await request(app)
      .get("/api/admin/recent-orders")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.orders).toHaveLength(1);
  });

  // Confirms the new admin user list excludes passwords and returns user metadata.
  it("returns the admin users list", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 1,
        name: "Admin User",
        email: "admin@pressgo.com",
        phone: "0711111111",
        role: "ADMIN",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        updatedAt: new Date("2026-01-02T10:00:00.000Z"),
      },
    ]);

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0].password).toBeUndefined();
  });

  // Ensures non-admin tokens are blocked from admin-only resources.
  it("rejects non-admin access to admin endpoints", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${customerToken()}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Access denied. You do not have permission."
    );
  });
});
