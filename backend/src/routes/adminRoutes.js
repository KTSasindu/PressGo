import express from "express";
import {
  getDashboardStats,
  getRecentOrders,
} from "../controllers/adminController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Platform administration and reporting APIs
 */

/**
 * @swagger
 * /api/admin/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieves aggregated platform metrics including users, shops, orders, payments, revenue, and average rating.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  "/dashboard-stats",
  authMiddleware,
  allowRoles("ADMIN"),
  getDashboardStats
);

/**
 * @swagger
 * /api/admin/recent-orders:
 *   get:
 *     summary: Get recent orders
 *     description: Retrieves the 10 most recent orders for admin monitoring.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  "/recent-orders",
  authMiddleware,
  allowRoles("ADMIN"),
  getRecentOrders
);

export default router;
