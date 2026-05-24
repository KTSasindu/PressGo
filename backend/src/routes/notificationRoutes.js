import express from "express";
import {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  getAllNotifications,
} from "../controllers/notificationController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User and admin notification management APIs
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     description: Admin-only endpoint for creating a notification for a specific user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 3
 *               title:
 *                 type: string
 *                 example: Order Ready for Pickup
 *               message:
 *                 type: string
 *                 example: Your laundry order is ready for pickup.
 *               type:
 *                 type: string
 *                 example: ORDER_UPDATE
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN"),
  createNotification
);

/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     summary: Get my notifications
 *     description: Retrieves notifications for the authenticated user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/my",
  authMiddleware,
  getMyNotifications
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     description: Marks a notification as read for its owner or for an admin user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

/**
 * @swagger
 * /api/notifications/admin/all:
 *   get:
 *     summary: Get all notifications
 *     description: Admin-only endpoint for retrieving all notifications across the platform.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  "/admin/all",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllNotifications
);

export default router;
