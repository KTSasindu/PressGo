import prisma from "../config/prisma.js";

export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        message: "userId, title and message are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: Number(userId),
        title,
        message,
        type,
      },
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "You can only update your own notifications",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: Number(id) },
      data: {
        isRead: true,
      },
    });

    res.json({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Mark notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Get all notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};