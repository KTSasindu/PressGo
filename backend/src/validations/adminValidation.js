import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "LAUNDRY_OWNER", "DRIVER", "ADMIN"]),
});
