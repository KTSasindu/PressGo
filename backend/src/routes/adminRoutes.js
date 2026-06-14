import express from "express";
import {
  getDashboardStats,
  getRecentOrders,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/adminController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { updateUserRoleSchema } from "../validations/adminValidation.js";

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

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Admin-only endpoint for retrieving all platform users without password fields.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  "/users",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllUsers
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Admin-only endpoint for retrieving a single platform user without password fields.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  "/users/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  getUserById
);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     description: Admin-only endpoint for updating a user's role.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum:
 *                   - CUSTOMER
 *                   - LAUNDRY_OWNER
 *                   - DRIVER
 *                   - ADMIN
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/users/:id/role",
  authMiddleware,
  allowRoles("ADMIN"),
  validate(updateUserRoleSchema),
  updateUserRole
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Admin-only endpoint for deleting a platform user, excluding the current admin account.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: User cannot be deleted because related records exist or admin attempted self-delete
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/users/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  deleteUser
);

export default router;
