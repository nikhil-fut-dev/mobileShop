import { Router } from "express";

import branchController from "./branch.controller.js";

import { protect } from "../../middleware/protect.js";
import { requirePermission } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";

import {
  createBranchSchema,
  updateBranchSchema,
  branchIdParamSchema,
  branchListQuerySchema,
  updateBranchStatusSchema,
} from "./validators/branch.validator.js";

import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { asyncHandler } from "../../shared/helpers/asyncHandler.js";

const router = Router();

// All branch routes require authentication.
router.use(protect);

// Create branch
router.post(
  "/",
  requirePermission(PERMISSIONS.BRANCHES_CREATE),
  validate(createBranchSchema),
  asyncHandler(branchController.createBranch),
);

// Get all branches
router.get(
  "/",
  requirePermission(PERMISSIONS.BRANCHES_READ),
  validate(branchListQuerySchema),
  asyncHandler(branchController.getBranches),
);

// Get branch by ID
router.get(
  "/:branchId",
  requirePermission(PERMISSIONS.BRANCHES_READ),
  validate(branchIdParamSchema),
  asyncHandler(branchController.getBranchById),
);

// Update branch details
router.patch(
  "/:branchId",
  requirePermission(PERMISSIONS.BRANCHES_UPDATE),
  validate(updateBranchSchema),
  asyncHandler(branchController.updateBranch),
);

// Update branch status
router.patch(
  "/:branchId/status",
  requirePermission(PERMISSIONS.BRANCHES_UPDATE),
  validate(updateBranchStatusSchema),
  asyncHandler(branchController.updateBranchStatus),
);

export default router;
