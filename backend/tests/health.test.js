import request from "supertest";
import app from "../src/server.js";

describe("Health route", () => {
  it("returns the backend status message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "PressGo Backend Running 🚀",
    });
  });
});
