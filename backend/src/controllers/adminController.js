import prisma from "../config/prisma.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalLaundryOwners,
      totalShops,
      activeShops,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalPayments,
      paidPayments,
      reviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "LAUNDRY_OWNER" } }),
      prisma.laundryShop.count(),
      prisma.laundryShop.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "PAID" } }),
      prisma.review.findMany({
        select: { rating: true },
      }),
    ]);

    const averageRating =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    const totalRevenueResult = await prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });

    const platformRevenueResult = await prisma.commission.aggregate({
      _sum: {
        platformAmount: true,
      },
    });

    const laundryRevenueResult = await prisma.commission.aggregate({
      _sum: {
        laundryShopAmount: true,
      },
    });

    res.json({
      stats: {
        totalUsers,
        totalCustomers,
        totalLaundryOwners,
        totalShops,
        activeShops,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalPayments,
        paidPayments,
        totalRevenue: totalRevenueResult._sum.amount || 0,
        platformRevenue: platformRevenueResult._sum.platformAmount || 0,
        laundryRevenue: laundryRevenueResult._sum.laundryShopAmount || 0,
        averageRating: Number(averageRating.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error("Recent orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};