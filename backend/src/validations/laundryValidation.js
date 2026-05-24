import { z } from "zod";

export const createLaundrySchema = z.object({
  ownerId: z.number().int().positive(),
  name: z.string().min(2),
  address: z.string().min(3),
  phone: z.string().min(7),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export const updateLaundrySchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(3).optional(),
  phone: z.string().min(7).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});