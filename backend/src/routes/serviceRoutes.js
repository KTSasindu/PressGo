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

router.get("/shop/:laundryShopId", getServicesByShop);

router.get(
  "/owner/my-services",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER"),
  getMyShopServices
);

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  validate(createServiceSchema),
  createService
);

router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  validate(updateServiceSchema),
  updateService
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "LAUNDRY_OWNER"),
  deleteService
);

export default router;