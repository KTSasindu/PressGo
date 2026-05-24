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

router.get("/active", getActiveLaundryShops);

router.get(
  "/admin/all",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllLaundryShops
);

router.get(
  "/owner/my-shop",
  authMiddleware,
  allowRoles("LAUNDRY_OWNER"),
  getMyLaundryShop
);

router.get("/:id", getLaundryShopById);

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN"),
  createLaundryShop
);

router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  updateLaundryShop
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  deleteLaundryShop
);

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN"),
  validate(createLaundrySchema),
  createLaundryShop
);

router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  validate(updateLaundrySchema),
  updateLaundryShop
);
export default router;