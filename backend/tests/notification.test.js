import { jest } from "@jest/globals";
import request from "supertest";
import { createAuthToken, TEST_JWT_SECRET } from "./helpers/auth.js";
import { createMockPrisma } from "./helpers/mockPrisma.js";

const mockPrisma = createMockPrisma();

jest.unstable_mockModule("../src/config/prisma.js", () => ({
  default: mockPrisma,
}));

const { default: app } = await import("../src/server.js");

describe("Notification routes", () => {
  const customerToken = () =>
    createAuthToken({ id: 31, role: "CUSTOMER" });

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verifies authenticated users can fetch their notifications feed.
  it("fetches notifications for the authenticated user", async () => {
    mockPrisma.notification.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 31,
        title: "Payment Status Updated",
        message: "Payment for order #7 is now PAID.",
        isRead: false,
      },
    ]);

    const response = await request(app)
      .get("/api/notifications/my")
      .set("Authorization", `Bearer ${customerToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.notifications).toHaveLength(1);
  });

  // Confirms the mark-as-read flow updates only the owner's notification.
  it("marks a notification as read", async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({
      id: 5,
      userId: 31,
      isRead: false,
    });
    mockPrisma.notification.update.mockResolvedValue({
      id: 5,
      userId: 31,
      isRead: true,
    });

    const response = await request(app)
      .patch("/api/notifications/5/read")
      .set("Authorization", `Bearer ${customerToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.notification.isRead).toBe(true);
  });

  // Protects the notifications feed from unauthenticated requests.
  it("rejects unauthorized notification access", async () => {
    const response = await request(app).get("/api/notifications/my");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication token is required");
  });
});
