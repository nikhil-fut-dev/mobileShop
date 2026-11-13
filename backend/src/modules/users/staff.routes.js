import { Router } from "express";

import staffController from "./staff.controller.js";

import { protect } from "../../middleware/protect.js";
import { requirePermission } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";

import {
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
} from "./validators/staff.validator.js";

import { PERMISSIONS } from "../../shared/constants/permissions.js";

import { asyncHandler } from "../../shared/helpers/asyncHandler.js";

const router = Router();

// Every staff management route requires authentication.
router.use(protect);

// Create staff - Owner only through USERS_CREATE permission.
router.post(
  "/staff",
  requirePermission(PERMISSIONS.USERS_CREATE),
  validate(createStaffSchema),
  asyncHandler(staffController.createStaff),
);

// Get staff list - Owner and Admin.
router.get(
  "/staff",
  requirePermission(PERMISSIONS.USERS_READ),
  asyncHandler(staffController.getStaff),
);

// Get one staff member - Owner and Admin.
router.get(
  "/staff/:userId",
  requirePermission(PERMISSIONS.USERS_READ),
  validate(updateStaffSchema.pick({ params: true })),
  asyncHandler(staffController.getStaffById),
);

// Update staff - Owner only.
router.patch(
  "/staff/:userId",
  requirePermission(PERMISSIONS.USERS_UPDATE),
  validate(updateStaffSchema),
  asyncHandler(staffController.updateStaff),
);

// Change staff account status - Owner only.
router.patch(
  "/staff/:userId/status",
  requirePermission(PERMISSIONS.USERS_UPDATE),
  validate(updateStaffStatusSchema),
  asyncHandler(staffController.updateStaffStatus),
);

export default router;
