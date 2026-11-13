import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid branch ID");

const branchAddressSchema = z
  .object({
    street: z.string().trim().min(2).max(200),
    area: z.string().trim().max(100).optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(4).max(10),
    country: z.string().trim().min(2).max(100).default("India"),
  })
  .strict();

const updateAddressSchema = branchAddressSchema
  .omit({ country: true })
  .partial()
  .extend({
    country: z.string().trim().min(2).max(100).optional(),
  });

const branchFieldsSchema = z.object({
  name: z.string().trim().min(2).max(100),

  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9-]+$/, "Invalid branch code"),

  address: branchAddressSchema,

  phone: z.string().trim().max(20).optional(),

  email: z.string().trim().email().max(254).optional(),

  status: z.enum(["active", "inactive"]).optional(),
});

export const createBranchSchema = z.object({
  body: branchFieldsSchema.strict(),
});

const updateBranchFieldsSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3)
      .max(20)
      .regex(/^[A-Z0-9-]+$/, "Invalid branch code")
      .optional(),

    address: updateAddressSchema.optional(),

    phone: z.string().trim().max(20).optional(),

    email: z.string().trim().email().max(254).optional(),

    status: z.enum(["active", "inactive"]).optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for update",
  );

export const updateBranchSchema = z.object({
  params: z.object({
    branchId: objectIdSchema,
  }),

  body: updateBranchFieldsSchema,
});

export const branchIdParamSchema = z.object({
  params: z.object({
    branchId: objectIdSchema,
  }),
});

export const branchListQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      status: z.enum(["active", "inactive"]).optional(),
      search: z.string().trim().max(100).optional(),
    })
    .strict(),
});

export const updateBranchStatusSchema = z.object({
  params: z.object({
    branchId: objectIdSchema,
  }),

  body: z
    .object({
      status: z.enum(["active", "inactive"]),
    })
    .strict(),
});
