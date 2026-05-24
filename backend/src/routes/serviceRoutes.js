import express from "express";
import {
  createService,
  getServicesByShop,
  getMyShopServices,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";

import {
  createServiceSchema,
  updateServiceSchema,
} from "../validations/serviceValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Laundry service management APIs
 */

/**
 * @swagger
 * /api/services/shop/{laundryShopId}:
 *   get:
 *     summary: Get services by laundry shop
 *     description: Retrieves all available services for a specific laundry shop.
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: laundryShopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Laundry shop ID
 *     responses:
 *       200:
 *         description: Services fetched successfully
 *       404:
 *         description: Laundry shop not found
 *       500:
 *         description: Server error
 */
router.get("/shop/:laundryShopId", getServicesByShop);

/**
 * @swagger
 * /api/services/owner/my-services:
 *   get:
 *     summary: Get laundry owner's services
 *     description: Retrieves all services belonging to the logged-in laundry owner.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Services fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  "/owner/my-services",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER"),
  getMyShopServices
);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a laundry service
 *     description: Allows admins or laundry owners to create a new laundry service.
 *     tags:
 *       - Services
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
 *               - name
 *               - price
 *               - unitType
 *             properties:
 *               laundryShopId:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Wash and Fold
 *               description:
 *                 type: string
 *                 example: Normal washing and folding service
 *               price:
 *                 type: number
 *                 example: 350
 *               unitType:
 *                 type: string
 *                 enum:
 *                   - KG
 *                   - ITEM
 *                 example: KG
 *               estimatedTime:
 *                 type: string
 *                 example: 24 hours
 *     responses:
 *       201:
 *         description: Service created successfully
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
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  validate(createServiceSchema),
  createService
);

/**
 * @swagger
 * /api/services/{id}:
 *   patch:
 *     summary: Update a laundry service
 *     description: Allows admins or laundry owners to update an existing service.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               unitType:
 *                 type: string
 *                 enum:
 *                   - KG
 *                   - ITEM
 *               estimatedTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  validate(updateServiceSchema),
  updateService
);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete a laundry service
 *     description: Allows admins or laundry owners to delete a laundry service.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  deleteService
);

export default router;