import prisma from "../config/prisma.js";

export const createService = async (req, res) => {
  try {
    const { laundryShopId, name, description, price, unitType, estimatedTime } = req.body;

    if (!laundryShopId || !name || !price || !unitType) {
      return res.status(400).json({
        message: "laundryShopId, name, price and unitType are required",
      });
    }

    const shop = await prisma.laundryShop.findUnique({
      where: { id: Number(laundryShopId) },
    });

    if (!shop) {
      return res.status(404).json({
        message: "Laundry shop not found",
      });
    }

    if (req.user.role === "LAUNDRY_OWNER" && shop.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "You can only add services to your own laundry shop",
      });
    }

    const service = await prisma.service.create({
      data: {
        laundryShopId: Number(laundryShopId),
        name,
        description,
        price,
        unitType,
        estimatedTime,
      },
    });

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getServicesByShop = async (req, res) => {
  try {
    const { laundryShopId } = req.params;

    const services = await prisma.service.findMany({
      where: {
        laundryShopId: Number(laundryShopId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ services });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyShopServices = async (req, res) => {
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

    const services = await prisma.service.findMany({
      where: {
        laundryShopId: shop.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ services });
  } catch (error) {
    console.error("Get my services error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, unitType, estimatedTime } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: Number(id) },
      include: {
        laundryShop: true,
      },
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    if (
      req.user.role === "LAUNDRY_OWNER" &&
      service.laundryShop.ownerId !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only update services of your own laundry shop",
      });
    }

    const updatedService = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price,
        unitType,
        estimatedTime,
      },
    });

    res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id: Number(id) },
      include: {
        laundryShop: true,
      },
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    if (
      req.user.role === "LAUNDRY_OWNER" &&
      service.laundryShop.ownerId !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only delete services of your own laundry shop",
      });
    }

    await prisma.service.delete({
      where: { id: Number(id) },
    });

    res.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ message: "Server error" });
  }
};