import express from "express";
import {
  assignDriver,
  getMyDeliveries,
  markPickedUp,
  markDelivered,
  getAllDeliveries,
} from "../controllers/deliveryController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  assignDriverSchema,
  markDeliveredSchema,
} from "../validations/deliveryValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Deliveries
 *   description: Delivery assignment and tracking APIs
 */

/**
 * @swagger
 * /api/deliveries/assign:
 *   post:
 *     summary: Assign a driver to an order
 *     description: Allows an admin or laundry owner to assign a driver to an order for delivery handling.
 *     tags:
 *       - Deliveries
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - driverId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               driverId:
 *                 type: integer
 *                 example: 5
 *               pickupNote:
 *                 type: string
 *                 example: Call the customer before pickup
 *     responses:
 *       201:
 *         description: Driver assigned successfully
 *       400:
 *         description: Validation failed, order already has a driver, or driver is invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post(
  "/assign",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  validate(assignDriverSchema),
  assignDriver
);

/**
 * @swagger
 * /api/deliveries/{id}/delivered:
 *   patch:
 *     summary: Mark a delivery as delivered
 *     description: Allows the assigned driver to mark a delivery assignment as delivered and optionally add a delivery note.
 *     tags:
 *       - Deliveries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryNote:
 *                 type: string
 *                 example: Delivered to the customer at the front gate
 *     responses:
 *       200:
 *         description: Order marked as delivered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Delivery assignment not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/delivered",
  authMiddleware,
  allowRoles("DRIVER"),
  validate(markDeliveredSchema),
  markDelivered
);

/**
 * @swagger
 * /api/deliveries/my-deliveries:
 *   get:
 *     summary: Get assigned deliveries for the logged-in driver
 *     description: Retrieves all delivery assignments belonging to the authenticated driver.
 *     tags:
 *       - Deliveries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deliveries fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  "/my-deliveries",
  authMiddleware,
  allowRoles("DRIVER"),
  getMyDeliveries
);

/**
 * @swagger
 * /api/deliveries/{id}/picked-up:
 *   patch:
 *     summary: Mark a delivery as picked up
 *     description: Allows the assigned driver to mark an order as picked up.
 *     tags:
 *       - Deliveries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delivery assignment ID
 *     responses:
 *       200:
 *         description: Order marked as picked up
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Delivery assignment not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/picked-up",
  authMiddleware,
  allowRoles("DRIVER"),
  markPickedUp
);

/**
 * @swagger
 * /api/deliveries/admin/all:
 *   get:
 *     summary: Get all delivery assignments
 *     description: Admin-only endpoint for retrieving all delivery assignments across the platform.
 *     tags:
 *       - Deliveries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deliveries fetched successfully
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
  getAllDeliveries
);

export default router;
