import prisma from "../config/prisma.js";

export const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({
        message: "orderId and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { review: true },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        message: "You can only review your own order",
      });
    }

    if (order.status !== "COMPLETED") {
      return res.status(400).json({
        message: "You can only review completed orders",
      });
    }

    if (order.review) {
      return res.status(400).json({
        message: "Review already exists for this order",
      });
    }

    const review = await prisma.review.create({
      data: {
        orderId: Number(orderId),
        rating: Number(rating),
        comment,
      },
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getShopReviews = async (req, res) => {
  try {
    const { laundryShopId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        order: {
          laundryShopId: Number(laundryShopId),
        },
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ reviews });
  } catch (error) {
    console.error("Get shop reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
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

    res.json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};