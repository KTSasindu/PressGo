import { jest } from "@jest/globals";
import request from "supertest";
import { createAuthToken, TEST_JWT_SECRET } from "./helpers/auth.js";
import { createMockPrisma } from "./helpers/mockPrisma.js";

const mockPrisma = createMockPrisma();

jest.unstable_mockModule("../src/config/prisma.js", () => ({
  default: mockPrisma,
}));

const { default: app } = await import("../src/server.js");

describe("Order routes", () => {
  const customerToken = () =>
    createAuthToken({ id: 21, role: "CUSTOMER" });

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verifies a customer can create an order when shop and service checks pass.
  it("creates an order successfully", async () => {
    mockPrisma.laundryShop.findUnique.mockResolvedValue({
      id: 1,
      status: "ACTIVE",
    });
    mockPrisma.service.findUnique.mockResolvedValue({
      id: 7,
      laundryShopId: 1,
      price: 500,
    });
    mockPrisma.order.create.mockResolvedValue({
      id: 99,
      laundryShopId: 1,
      customerId: 21,
      status: "PENDING",
      totalAmount: 1000,
      items: [],
      laundryShop: { id: 1, name: "Fresh Wash Laundry" },
      statusHistory: [],
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken()}`)
      .send({
        laundryShopId: 1,
        pickupAddress: "No 25, Peradeniya Road, Kandy",
        pickupDate: "2026-06-20T10:00:00.000Z",
        items: [{ serviceId: 7, quantity: 2 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Order created successfully");
    expect(response.body.order.id).toBe(99);
  });

  // Ensures validation stops malformed order payloads before controller logic.
  it("rejects invalid order payloads", async () => {
    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken()}`)
      .send({
        laundryShopId: 1,
        items: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // Confirms a customer can fetch only their own order list.
  it("fetches the current customer's orders", async () => {
    mockPrisma.order.findMany.mockResolvedValue([
      {
        id: 1,
        customerId: 21,
        status: "PENDING",
        laundryShop: { id: 1, name: "Fresh Wash Laundry" },
        items: [],
      },
    ]);

    const response = await request(app)
      .get("/api/orders/my-orders")
      .set("Authorization", `Bearer ${customerToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.orders).toHaveLength(1);
    expect(response.body.orders[0].id).toBe(1);
  });

  // Protects the order endpoints from missing authentication headers.
  it("rejects unauthorized access to orders", async () => {
    const response = await request(app).get("/api/orders/my-orders");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication token is required");
  });
});
