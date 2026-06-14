import jwt from "jsonwebtoken";

export const TEST_JWT_SECRET = "pressgo-test-secret";

export const createAuthToken = (payload) =>
  jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: "1h" });
