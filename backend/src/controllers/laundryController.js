import prisma from "../config/prisma.js";

export const createLaundryShop = async (req, res) => {
  try {
    const { ownerId, name, address, phone, openTime, closeTime } = req.body;

    if (!ownerId || !name || !address || !phone) {
      return res.status(400).json({
        message: "ownerId, name, address and phone are required",
      });
    }

    const owner = await prisma.user.findUnique({
      where: { id: Number(ownerId) },
    });

    if (!owner || owner.role !== "LAUNDRY_OWNER") {
      return res.status(400).json({
        message: "Owner must be a valid LAUNDRY_OWNER user",
      });
    }

    const shop = await prisma.laundryShop.create({
      data: {
        ownerId: Number(ownerId),
        name,
        address,
        phone,
        openTime,
        closeTime,
      },
    });

    res.status(201).json({
      message: "Laundry shop created successfully",
      shop,
    });
  } catch (error) {
    console.error("Create laundry error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllLaundryShops = async (req, res) => {
  try {
    const shops = await prisma.laundryShop.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ shops });
  } catch (error) {
    console.error("Get shops error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getActiveLaundryShops = async (req, res) => {
  try {
    const shops = await prisma.laundryShop.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        services: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ shops });
  } catch (error) {
    console.error("Get active shops error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLaundryShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await prisma.laundryShop.findUnique({
      where: { id: Number(id) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: true,
      },
    });

    if (!shop) {
      return res.status(404).json({
        message: "Laundry shop not found",
      });
    }

    res.json({ shop });
  } catch (error) {
    console.error("Get shop error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyLaundryShop = async (req, res) => {
  try {
    const shop = await prisma.laundryShop.findFirst({
      where: {
        ownerId: req.user.id,
      },
      include: {
        services: true,
        orders: true,
      },
    });

    if (!shop) {
      return res.status(404).json({
        message: "No laundry shop assigned to this owner",
      });
    }

    res.json({ shop });
  } catch (error) {
    console.error("Get my shop error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLaundryShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, openTime, closeTime, status } = req.body;

    const shop = await prisma.laundryShop.findUnique({
      where: { id: Number(id) },
    });

    if (!shop) {
      return res.status(404).json({
        message: "Laundry shop not found",
      });
    }

    const updatedShop = await prisma.laundryShop.update({
      where: { id: Number(id) },
      data: {
        name,
        address,
        phone,
        openTime,
        closeTime,
        status,
      },
    });

    res.json({
      message: "Laundry shop updated successfully",
      shop: updatedShop,
    });
  } catch (error) {
    console.error("Update shop error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLaundryShop = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await prisma.laundryShop.findUnique({
      where: { id: Number(id) },
    });

    if (!shop) {
      return res.status(404).json({
        message: "Laundry shop not found",
      });
    }

    await prisma.laundryShop.update({
      where: { id: Number(id) },
      data: {
        status: "INACTIVE",
      },
    });

    res.json({
      message: "Laundry shop deactivated successfully",
    });
  } catch (error) {
    console.error("Delete shop error:", error);
    res.status(500).json({ message: "Server error" });
  }
};