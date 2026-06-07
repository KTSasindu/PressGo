import prisma from "../config/prisma.js";

export const createOrder = async (req, res) => {
  try {
    const { laundryShopId, pickupAddress, pickupDate, items } = req.body;

    if (!laundryShopId || !pickupAddress || !pickupDate || !items || items.length === 0) {
      return res.status(400).json({
        message: "laundryShopId, pickupAddress, pickupDate and items are required",
      });
    }

    const shop = await prisma.laundryShop.findUnique({
      where: { id: Number(laundryShopId) },
    });

    if (!shop || shop.status !== "ACTIVE") {
      return res.status(404).json({
        message: "Active laundry shop not found",
      });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const service = await prisma.service.findUnique({
        where: { id: Number(item.serviceId) },
      });

      if (!service || service.laundryShopId !== Number(laundryShopId)) {
        return res.status(400).json({
          message: `Invalid service selected: ${item.serviceId}`,
        });
      }

      const quantity = Number(item.quantity);
      const price = Number(service.price);
      totalAmount += price * quantity;

      orderItemsData.push({
        serviceId: service.id,
        quantity,
        price,
      });
    }

    const order = await prisma.order.create({
      data: {
        customerId: req.user.id,
        laundryShopId: Number(laundryShopId),
        pickupAddress,
        pickupDate: new Date(pickupDate),
        totalAmount,
        items: {
            create: orderItemsData,
        },
        statusHistory: {
            create: {
                status: "PENDING",
                note: "Order created by customer",
                changedBy: req.user.id,
        },
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        laundryShop: true,
        statusHistory: true,
      },
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        customerId: req.user.id,
      },
      include: {
        laundryShop: true,
        items: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLaundryOwnerOrders = async (req, res) => {
  try {
    const shop = await prisma.laundryShop.findFirst({
      where: {
        ownerId: req.user.id,
      },
    });

    if (!shop) {
      return res.status(404).json({
        message: "No laundry shop assigned to this owner",
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        laundryShopId: shop.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error("Get owner orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        laundryShop: true,
        items: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        laundryShop: true,
        items: {
          include: {
            service: true,
          },
        },
        payment: true,
        review: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
        deliveryAssignment: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (req.user.role === "CUSTOMER" && order.customerId !== req.user.id) {
      return res.status(403).json({
        message: "You can only view your own orders",
      });
    }

    if (req.user.role === "LAUNDRY_OWNER") {
      const shop = await prisma.laundryShop.findFirst({
        where: { ownerId: req.user.id },
      });

      if (!shop || order.laundryShopId !== shop.id) {
        return res.status(403).json({
          message: "You can only view orders of your own laundry shop",
        });
      }
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatuses = [
      "PENDING",
      "ACCEPTED_BY_LAUNDRY",
      "PICKED_UP",
      "WASHING",
      "READY_FOR_DELIVERY",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        laundryShop: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      req.user.role === "LAUNDRY_OWNER" &&
      order.laundryShop.ownerId !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only update orders of your own laundry shop",
      });
    }

    const updatedOrder = await prisma.order.update({
        where: { id: Number(id) },
        data: {
            status,
            statusHistory: {
                create: {
                    status,
                    note,
                    changedBy: req.user.id,
                },
            },
        },
        include: {
            items: {
                include: {
                    service: true,
                },
            },
            laundryShop: true,
            statusHistory: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    await prisma.notification.create({
        data: {
            userId: updatedOrder.customerId,
            title: "Order Status Updated",
            message: `Your order #${updatedOrder.id} status changed to ${updatedOrder.status}.`,
            type: "ORDER_STATUS",
        },
    });

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};