import { z } from "zod";

export const createServiceSchema = z.object({
  laundryShopId: z.number().int().positive(),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  unitType: z.enum(["KG", "ITEM"]),
  estimatedTime: z.string().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  unitType: z.enum(["KG", "ITEM"]).optional(),
  estimatedTime: z.string().optional(),
});