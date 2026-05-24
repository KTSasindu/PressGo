import express from "express";
import {
  createOrder,
  getMyOrders,
  getLaundryOwnerOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validations/orderValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Laundry order management APIs
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a laundry order
 *     description: Customer creates a new laundry order.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - laundryShopId
 *               - pickupAddress
 *               - pickupDate
 *               - items
 *             properties:
 *               laundryShopId:
 *                 type: integer
 *                 example: 1
 *               pickupAddress:
 *                 type: string
 *                 example: "No 25, Peradeniya Road, Kandy"
 *               pickupDate:
 *                 type: string
 *                 format: date-time
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/",
  authMiddleware,
  allowRoles("CUSTOMER"),
  validate(createOrderSchema),
  createOrder
);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get logged-in customer orders
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/my-orders",
  authMiddleware,
  allowRoles("CUSTOMER"),
  getMyOrders
);

/**
 * @swagger
 * /api/orders/owner/orders:
 *   get:
 *     summary: Get orders for the logged-in laundry owner
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/owner/orders",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER"),
  getLaundryOwnerOrders
);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/admin/all",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllOrders
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags:
 *       - Orders
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
 *         description: Order fetched successfully
 *       401:
 *         description: Unauthorized
 */

router.get(
  "/:id",
  authMiddleware,
  allowRoles("CUSTOMER", "LAUNDRY_OWNER", "ADMIN"),
  getOrderById
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Allows a laundry owner or admin to update the status of an order and optionally add a status note.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - ACCEPTED_BY_LAUNDRY
 *                   - PICKED_UP
 *                   - WASHING
 *                   - READY_FOR_DELIVERY
 *                   - DELIVERED
 *                   - COMPLETED
 *                   - CANCELLED
 *                   - REJECTED
 *                 example: WASHING
 *               note:
 *                 type: string
 *                 example: Laundry process started
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Validation failed or invalid order status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER", "ADMIN"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;