import prisma from "../config/prisma.js";

export const assignDriver = async (req, res) => {
  try {
    const { orderId, driverId, pickupNote } = req.body;

    if (!orderId || !driverId) {
      return res.status(400).json({
        message: "orderId and driverId are required",
      });
    }

    const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        include: {
            deliveryAssignment: true,
            customer: true,
        },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.deliveryAssignment) {
      return res.status(400).json({
        message: "Driver already assigned to this order",
      });
    }

    const driver = await prisma.user.findUnique({
      where: { id: Number(driverId) },
    });

    if (!driver || driver.role !== "DRIVER") {
      return res.status(400).json({
        message: "Selected user must be a valid DRIVER",
      });
    }

    const assignment = await prisma.deliveryAssignment.create({
      data: {
        orderId: Number(orderId),
        driverId: Number(driverId),
        pickupNote,
      },
      include: {
        order: true,
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    await prisma.notification.create({
        data: {
            userId: driver.id,
            title: "New Delivery Assigned",
            message: `You have been assigned to delivery order #${order.id}.`,
            type: "DELIVERY_ASSIGNMENT",
        },
    });

    await prisma.notification.create({
        data: {
            userId: order.customerId,
            title: "Driver Assigned",
            message: `A PressGo driver has been assigned to your order #${order.id}.`,
            type: "DELIVERY_ASSIGNMENT",
        },
    });

    res.status(201).json({
      message: "Driver assigned successfully",
      assignment,
    });
  } catch (error) {
    console.error("Assign driver error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await prisma.deliveryAssignment.findMany({
      where: {
        driverId: req.user.id,
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
            laundryShop: true,
            items: {
              include: {
                service: true,
              },
            },
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    res.json({ deliveries });
  } catch (error) {
    console.error("Get my deliveries error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markPickedUp = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: Number(id) },
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Delivery assignment not found",
      });
    }

    if (assignment.driverId !== req.user.id) {
      return res.status(403).json({
        message: "You can only update your own delivery assignment",
      });
    }

    const updatedAssignment = await prisma.deliveryAssignment.update({
      where: { id: Number(id) },
      data: {
        pickedUpAt: new Date(),
        order: {
          update: {
            status: "PICKED_UP",
            statusHistory: {
              create: {
                status: "PICKED_UP",
                note: "Order picked up by driver",
                changedBy: req.user.id,
              },
            },
          },
        },
      },
      include: {
        order: true,
      },
    });

    res.json({
      message: "Order marked as picked up",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Mark picked up error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryNote } = req.body;

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: Number(id) },
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Delivery assignment not found",
      });
    }

    if (assignment.driverId !== req.user.id) {
      return res.status(403).json({
        message: "You can only update your own delivery assignment",
      });
    }

    const updatedAssignment = await prisma.deliveryAssignment.update({
      where: { id: Number(id) },
      data: {
        deliveredAt: new Date(),
        deliveryNote,
        order: {
          update: {
            status: "DELIVERED",
            statusHistory: {
              create: {
                status: "DELIVERED",
                note: deliveryNote || "Order delivered by driver",
                changedBy: req.user.id,
              },
            },
          },
        },
      },
      include: {
        order: true,
      },
    });

    res.json({
      message: "Order marked as delivered",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Mark delivered error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await prisma.deliveryAssignment.findMany({
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            laundryShop: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    res.json({ deliveries });
  } catch (error) {
    console.error("Get all deliveries error:", error);
    res.status(500).json({ message: "Server error" });
  }
};