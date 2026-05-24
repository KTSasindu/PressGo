import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

router.get(
  "/admin-only",
  authMiddleware,
  allowRoles("ADMIN"),
  (req, res) => {
    res.json({
      message: "Admin route accessed successfully",
      user: req.user,
    });
  }
);

router.get(
  "/laundry-owner-only",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER"),
  (req, res) => {
    res.json({
      message: "Laundry owner route accessed successfully",
      user: req.user,
    });
  }
);

router.get(
  "/customer-only",
  authMiddleware,
  allowRoles("CUSTOMER"),
  (req, res) => {
    res.json({
      message: "Customer route accessed successfully",
      user: req.user,
    });
  }
);

export default router;