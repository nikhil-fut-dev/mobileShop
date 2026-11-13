import mongoose from "mongoose";

import Branch from "../models/Branch.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus.js";

export async function validateActiveBranchIds(branchIds = []) {
  if (!Array.isArray(branchIds)) {
    throw new AppError("Branch IDs must be an array", HTTP_STATUS.BAD_REQUEST);
  }

  // Remove duplicate IDs.
  const uniqueIds = [...new Set(branchIds.map(String))];

  // Validate ObjectId format.
  const invalidIds = uniqueIds.filter((id) => !mongoose.isValidObjectId(id));

  if (invalidIds.length > 0) {
    throw new AppError(
      "One or more branch IDs are invalid",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  // Empty branch assignment is allowed.
  if (uniqueIds.length === 0) {
    return [];
  }

  // Only active branches can be assigned.
  const activeBranches = await Branch.find({
    _id: { $in: uniqueIds },
    status: "active",
  })
    .select("_id")
    .lean();

  if (activeBranches.length !== uniqueIds.length) {
    throw new AppError(
      "One or more branches do not exist or are inactive",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return activeBranches.map((branch) => branch._id);
}
