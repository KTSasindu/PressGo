import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.number().int().positive(),
  method: z.string().min(2),
  amount: z.number().positive(),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
});