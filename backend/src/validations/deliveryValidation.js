import { z } from "zod";

export const assignDriverSchema = z.object({
  orderId: z.number().int().positive(),
  driverId: z.number().int().positive(),
  pickupNote: z.string().optional(),
});

export const markDeliveredSchema = z.object({
  deliveryNote: z.string().optional(),
});