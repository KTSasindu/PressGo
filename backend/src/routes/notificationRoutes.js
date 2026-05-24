import express from "express";
import {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  getAllNotifications,
} from "../controllers/notificationController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN"),
  createNotification
);

router.get(
  "/my",
  authMiddleware,
  getMyNotifications
);

router.patch(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

router.get(
  "/admin/all",
  authMiddleware,
  allowRoles("ADMIN"),
  getAllNotifications
);

export default router;