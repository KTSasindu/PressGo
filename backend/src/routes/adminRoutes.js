import express from "express";
import {
  getDashboardStats,
  getRecentOrders,
} from "../controllers/adminController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  authMiddleware,
  allowRoles("ADMIN"),
  getDashboardStats
);

router.get(
  "/recent-orders",
  authMiddleware,
  allowRoles("ADMIN"),
  getRecentOrders
);

export default router;