import { z } from "zod";

export const createOrderSchema = z.object({
  laundryShopId: z.number().int().positive(),
  pickupAddress: z.string().min(3),
  pickupDate: z.string().datetime(),
  items: z.array(
    z.object({
      serviceId: z.number().int().positive(),
      quantity: z.number().positive(),
    })
  ).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "ACCEPTED_BY_LAUNDRY",
    "PICKED_UP",
    "WASHING",
    "READY_FOR_DELIVERY",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
  ]),
  note: z.string().optional(),
});