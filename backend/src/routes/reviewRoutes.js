import express from "express";
import {
  createReview,
  getShopReviews,
  getAllReviews,
} from "../controllers/reviewController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { createReviewSchema } from "../validations/reviewValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Laundry review and rating APIs
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a customer review
 *     description: Allows a customer to create a rating and review for a completed order.
 *     tags:
 *       - Reviews
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
 *               - rating
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent service and fast delivery.
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  allowRoles("CUSTOMER"),
  validate(createReviewSchema),
  createReview
);

/**
 * @swagger
 * /api/reviews/shop/{laundryShopId}:
 *   get:
 *     summary: Get reviews for a laundry shop
 *     description: Retrieves all reviews and ratings related to a specific laundry shop.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: laundryShopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Laundry shop ID
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 *       404:
 *         description: Laundry shop not found
 *       500:
 *         description: Server error
 */
router.get("/shop/:laundryShopId", getShopReviews);

/**
 * @swagger
 * /api/reviews/admin/all:
 *   get:
 *     summary: Get all reviews
 *     description: Admin-only endpoint for retrieving all customer reviews across the platform.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
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
  getAllReviews
);

export default router;