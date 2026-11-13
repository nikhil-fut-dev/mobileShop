import mongoose from "mongoose";

import { AppError } from "../errors/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

/**
 * Returns a branch filter for database queries.
 *
 * Owner:
 *   Can access all branches.
 *
 * Admin / Cashier:
 *   Can access only assigned branches.
 */
export function getBranchScope(user, requestedBranchId) {
  if (!user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  // Owner can access all branches.
  if (user.role === "owner") {
    if (requestedBranchId) {
      if (!mongoose.isValidObjectId(requestedBranchId)) {
        throw new AppError("Invalid branch ID", HTTP_STATUS.BAD_REQUEST);
      }

      return {
        branchId: new mongoose.Types.ObjectId(requestedBranchId),
      };
    }

    return {};
  }

  const assignedBranchIds = (user.branchIds || []).map((id) => id.toString());

  // Staff without assigned branches cannot access branch data.
  if (assignedBranchIds.length === 0) {
    throw new AppError(
      "No branch is assigned to your account",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (requestedBranchId) {
    if (!mongoose.isValidObjectId(requestedBranchId)) {
      throw new AppError("Invalid branch ID", HTTP_STATUS.BAD_REQUEST);
    }

    const hasAccess = assignedBranchIds.includes(requestedBranchId);

    if (!hasAccess) {
      throw new AppError(
        "You do not have access to this branch",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    return {
      branchId: new mongoose.Types.ObjectId(requestedBranchId),
    };
  }

  return {
    branchId: {
      $in: assignedBranchIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  };
}
