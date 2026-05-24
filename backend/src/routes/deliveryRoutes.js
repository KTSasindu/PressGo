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

router.post(
  "/assign",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  validate(assignDriverSchema),
  assignDriver
);

router.patch(
  "/:id/delivered",
  authMiddleware,
  allowRoles("DRIVER"),
  validate(markDeliveredSchema),
  markDelivered
);

router.get(
  "/my-deliveries",
  authMiddleware,
  allowRoles("DRIVER"),
  getMyDeliveries
);

router.patch(
  "/:id/picked-up",
  authMiddleware,
  allowRoles("DRIVER"),
  markPickedUp
);

router.patch(
  "/:id/delivered",
  authMiddleware,
  allowRoles("DRIVER"),
  markDelivered
);

router.get(
  "/admin/all",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllDeliveries
);

export default router;