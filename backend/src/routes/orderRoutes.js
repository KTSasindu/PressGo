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

router.post(
  "/",
  authMiddleware,
  allowRoles("CUSTOMER"),
  validate(createOrderSchema),
  createOrder
);

router.get(
  "/my-orders",
  authMiddleware,
  allowRoles("CUSTOMER"),
  getMyOrders
);

router.get(
  "/owner/orders",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER"),
  getLaundryOwnerOrders
);

router.get(
  "/admin/all",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllOrders
);

router.get(
  "/:id",
  authMiddleware,
  allowRoles("CUSTOMER", "LAUNDRY_OWNER", "ADMIN"),
  getOrderById
);

router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER", "ADMIN"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;