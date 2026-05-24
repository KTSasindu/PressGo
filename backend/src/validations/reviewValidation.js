import { z } from "zod";

export const createReviewSchema = z.object({
  orderId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});