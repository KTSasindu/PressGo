import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pressgo.com" },
    update: {},
    create: {
      name: "PressGo Admin",
      email: "admin@pressgo.com",
      phone: "0711111111",
      password,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "kithsiri@pressgo.com" },
    update: {},
    create: {
      name: "Kithsiri",
      email: "kithsiri@pressgo.com",
      phone: "0771234567",
      password,
      role: "CUSTOMER",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@freshwash.com" },
    update: {},
    create: {
      name: "Fresh Wash Owner",
      email: "owner@freshwash.com",
      phone: "0722222222",
      password,
      role: "LAUNDRY_OWNER",
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: "driver@pressgo.com" },
    update: {},
    create: {
      name: "PressGo Driver",
      email: "driver@pressgo.com",
      phone: "0755555555",
      password,
      role: "DRIVER",
    },
  });

  const shop = await prisma.laundryShop.upsert({
    where: { id: 1 },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Fresh Wash Laundry",
      address: "Peradeniya Road, Kandy",
      phone: "0812222222",
      openTime: "08:00",
      closeTime: "20:00",
      status: "ACTIVE",
    },
  });

  const washService = await prisma.service.create({
    data: {
      laundryShopId: shop.id,
      name: "Wash and Fold",
      description: "Normal washing and folding service",
      price: 350,
      unitType: "KG",
      estimatedTime: "24 hours",
    },
  });

  const ironingService = await prisma.service.create({
    data: {
      laundryShopId: shop.id,
      name: "Ironing",
      description: "Ironing service per item",
      price: 80,
      unitType: "ITEM",
      estimatedTime: "12 hours",
    },
  });

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      laundryShopId: shop.id,
      pickupAddress: "No 25, Peradeniya Road, Kandy",
      pickupDate: new Date(),
      totalAmount: 1100,
      status: "COMPLETED",
      paymentStatus: "PAID",
      items: {
        create: [
          {
            serviceId: washService.id,
            quantity: 2,
            price: 350,
          },
          {
            serviceId: ironingService.id,
            quantity: 5,
            price: 80,
          },
        ],
      },
      statusHistory: {
        create: {
          status: "PENDING",
          note: "Demo order created",
          changedBy: customer.id,
        },
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      method: "CASH",
      amount: 1100,
      status: "PAID",
    },
  });

  await prisma.commission.create({
    data: {
      orderId: order.id,
      platformRate: 10,
      platformAmount: 110,
      laundryShopAmount: 990,
    },
  });

  await prisma.deliveryAssignment.create({
    data: {
      orderId: order.id,
      driverId: driver.id,
      pickupNote: "Demo pickup assigned",
      deliveryNote: "Demo delivery completed",
      pickedUpAt: new Date(),
      deliveredAt: new Date(),
    },
  });

  await prisma.review.create({
    data: {
      orderId: order.id,
      rating: 5,
      comment: "Excellent demo service",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        title: "Welcome to PressGo",
        message: "Your demo account is ready.",
        type: "SYSTEM",
      },
      {
        userId: driver.id,
        title: "Demo Delivery Assigned",
        message: "You have a demo delivery assigned.",
        type: "DELIVERY",
      },
    ],
  });

  console.log("Seed completed successfully ✅");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });