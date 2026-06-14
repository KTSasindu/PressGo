import prisma from "../config/prisma.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

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

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: userSelect,
    });

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (req.user.id === userId) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    if (error?.code === "P2003" || error?.code === "P2014") {
      return res.status(400).json({
        message: "User cannot be deleted because related records exist",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};
