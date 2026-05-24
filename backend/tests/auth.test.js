import request from "supertest";
import app from "../src/server.js";

describe("Auth validation", () => {
  it("rejects an invalid register request", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "wrongemail",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });
});
