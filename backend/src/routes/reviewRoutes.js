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

router.post(
  "/",
  authMiddleware,
  allowRoles("CUSTOMER"),
  validate(createReviewSchema),
  createReview
);

router.post(
  "/",
  authMiddleware,
  allowRoles("CUSTOMER"),
  createReview
);

router.get("/shop/:laundryShopId", getShopReviews);

router.get(
  "/admin/all",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllReviews
);

export default router;