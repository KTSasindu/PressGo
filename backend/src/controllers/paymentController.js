import prisma from "../config/prisma.js";

export const createPayment = async (req, res) => {
  try {
    const { orderId, method, amount, status } = req.body;

    if (!orderId || !method || !amount) {
      return res.status(400).json({
        message: "orderId, method and amount are required",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { payment: true },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.payment) {
      return res.status(400).json({
        message: "Payment already exists for this order",
      });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: Number(orderId),
        method,
        amount,
        status: status || "PENDING",
      },
    });

    await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        paymentStatus: status || "PENDING",
      },
    });

    res.status(201).json({
      message: "Payment recorded successfully",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: Number(id) },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: Number(id) },
      data: { status },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: status,
      },
    });

    if (status === "PAID") {
        const order = await prisma.order.findUnique({
            where: { id: payment.orderId },
        });

        const existingCommission = await prisma.commission.findUnique({
            where: { orderId: payment.orderId },
        });

        if (order && !existingCommission) {
            const platformRate = 10;
            const totalAmount = Number(order.totalAmount);
            const platformAmount = (totalAmount * platformRate) / 100;
            const laundryShopAmount = totalAmount - platformAmount;

            await prisma.commission.create({
                data: {
                    orderId: payment.orderId,
                    platformRate,
                    platformAmount,
                    laundryShopAmount,
                },
            });
        }
    }

    const orderForNotification = await prisma.order.findUnique({
        where: { id: payment.orderId },
    });

    if (orderForNotification) {
        await prisma.notification.create({
            data: {
            userId: orderForNotification.customerId,
            title: "Payment Status Updated",
            message: `Payment for order #${orderForNotification.id} is now ${status}.`,
            type: "PAYMENT",
            },
        });
    }

    res.json({
      message: "Payment status updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ payments });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: {
        orderId: Number(orderId),
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found for this order",
      });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};