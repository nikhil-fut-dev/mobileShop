import mongoose from "mongoose";

import { AppError } from "../shared/errors/AppError.js";
import { HTTP_STATUS } from "../shared/constants/httpStatus.js";

export function checkBranchAccess({
  paramName = "branchId",
  allowOwner = true,
} = {}) {
  return function (req, res, next) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
      }

      const { role, branchIds = [] } = req.user;

      // Owner can access all branches.
      if (allowOwner && role === "owner") {
        return next();
      }

      const branchId = req.params[paramName];

      if (!branchId || !mongoose.isValidObjectId(branchId)) {
        throw new AppError(
          "Valid branch ID is required",
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      const hasAccess = branchIds.some(
        (assignedBranchId) => assignedBranchId.toString() === branchId,
      );

      if (!hasAccess) {
        throw new AppError(
          "You do not have access to this branch",
          HTTP_STATUS.FORBIDDEN,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
