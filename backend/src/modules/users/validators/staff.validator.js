import { z } from "zod";

import { ROLES } from "../../../shared/constants/roles.js";

const passwordSchema = z
  .string()
  .min(12, "Password must contain at least 12 characters")
  .max(72, "Password cannot exceed 72 characters")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password cannot exceed 72 UTF-8 bytes",
  );

export const createStaffSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2).max(100),

      email: z.string().trim().email().max(254),

      phone: z.string().trim().min(7).max(20).optional(),

      password: passwordSchema,

      role: z.enum([ROLES.ADMIN, ROLES.CASHIER]),

      branchIds: z
        .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid branch ID"))
        .optional()
        .default([]),
    })
    .strict(),
});

export const updateStaffSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
  }),

  body: z
    .object({
      fullName: z.string().trim().min(2).max(100).optional(),

      email: z.string().trim().email().max(254).optional(),

      phone: z.string().trim().min(7).max(20).nullable().optional(),

      role: z.enum([ROLES.ADMIN, ROLES.CASHIER]).optional(),

      branchIds: z
        .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid branch ID"))
        .optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field is required",
    ),
});

export const updateStaffStatusSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
  }),

  body: z
    .object({
      status: z.enum(["active", "inactive", "suspended"]),
    })
    .strict(),
});
