import express from "express";
import {
  createPayment,
  updatePaymentStatus,
  getAllPayments,
  getPaymentByOrder,
} from "../controllers/paymentController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
} from "../validations/paymentValidation.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  validate(createPaymentSchema),
  createPayment
);

router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus
);

router.get(
  "/admin/all",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllPayments
);

router.get(
  "/order/:orderId",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER", "CUSTOMER"),
  getPaymentByOrder
);

export default router;