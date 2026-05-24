import express from "express";
import {
  createLaundryShop,
  getAllLaundryShops,
  getActiveLaundryShops,
  getLaundryShopById,
  getMyLaundryShop,
  updateLaundryShop,
  deleteLaundryShop,
} from "../controllers/laundryController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createLaundrySchema,
  updateLaundrySchema,
} from "../validations/laundryValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Laundries
 *   description: Laundry shop management APIs
 */

/**
 * @swagger
 * /api/laundries/active:
 *   get:
 *     summary: Get active laundry shops
 *     description: Retrieves all active laundry shops that are available on the platform.
 *     tags:
 *       - Laundries
 *     responses:
 *       200:
 *         description: Active laundry shops fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/active", getActiveLaundryShops);

/**
 * @swagger
 * /api/laundries/admin/all:
 *   get:
 *     summary: Get all laundry shops
 *     description: Admin-only endpoint for retrieving all laundry shops, including owner and service details.
 *     tags:
 *       - Laundries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Laundry shops fetched successfully
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
  getAllLaundryShops
);

/**
 * @swagger
 * /api/laundries/owner/my-shop:
 *   get:
 *     summary: Get laundry owner's shop
 *     description: Retrieves the laundry shop assigned to the logged-in laundry owner.
 *     tags:
 *       - Laundries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Laundry shop fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: No laundry shop assigned to this owner
 *       500:
 *         description: Server error
 */
router.get(
  "/owner/my-shop",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER"),
  getMyLaundryShop
);

/**
 * @swagger
 * /api/laundries/{id}:
 *   get:
 *     summary: Get laundry shop by ID
 *     description: Retrieves a single laundry shop with its owner and service details.
 *     tags:
 *       - Laundries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Laundry shop ID
 *     responses:
 *       200:
 *         description: Laundry shop fetched successfully
 *       404:
 *         description: Laundry shop not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getLaundryShopById);

/**
 * @swagger
 * /api/laundries:
 *   post:
 *     summary: Create a laundry shop
 *     description: Admin-only endpoint for creating a new laundry shop for a valid laundry owner.
 *     tags:
 *       - Laundries
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerId
 *               - name
 *               - address
 *               - phone
 *             properties:
 *               ownerId:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Fresh Fold Laundry
 *               address:
 *                 type: string
 *                 example: "No 18, Main Street, Colombo"
 *               phone:
 *                 type: string
 *                 example: "+94771234567"
 *               openTime:
 *                 type: string
 *                 example: "08:00"
 *               closeTime:
 *                 type: string
 *                 example: "20:00"
 *     responses:
 *       201:
 *         description: Laundry shop created successfully
 *       400:
 *         description: Validation failed or owner is invalid
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
  allowRoles("ADMIN"),
  validate(createLaundrySchema),
  createLaundryShop
);

/**
 * @swagger
 * /api/laundries/{id}:
 *   patch:
 *     summary: Update a laundry shop
 *     description: Admin-only endpoint for updating laundry shop information.
 *     tags:
 *       - Laundries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Laundry shop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fresh Fold Laundry
 *               address:
 *                 type: string
 *                 example: "No 18, Main Street, Colombo"
 *               phone:
 *                 type: string
 *                 example: "+94771234567"
 *               openTime:
 *                 type: string
 *                 example: "08:00"
 *               closeTime:
 *                 type: string
 *                 example: "20:00"
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - INACTIVE
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Laundry shop updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Laundry shop not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  validate(updateLaundrySchema),
  updateLaundryShop
);

/**
 * @swagger
 * /api/laundries/{id}:
 *   delete:
 *     summary: Deactivate a laundry shop
 *     description: Admin-only endpoint for deactivating a laundry shop by setting its status to inactive.
 *     tags:
 *       - Laundries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Laundry shop ID
 *     responses:
 *       200:
 *         description: Laundry shop deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Laundry shop not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  deleteLaundryShop
);
export default router;
