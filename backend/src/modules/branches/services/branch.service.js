import mongoose from "mongoose";

import Branch from "../models/Branch.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus.js";

const BRANCH_SELECT =
  "name code address phone email status createdBy createdAt updatedAt";

function validateBranchId(branchId) {
  if (!mongoose.isValidObjectId(branchId)) {
    throw new AppError("Invalid branch ID", HTTP_STATUS.BAD_REQUEST);
  }
}

export async function createBranch(data, createdBy) {
  const existingBranch = await Branch.findOne({
    code: data.code,
  }).lean();

  if (existingBranch) {
    throw new AppError("Branch code already exists", HTTP_STATUS.CONFLICT);
  }

  const branch = await Branch.create({
    ...data,
    createdBy,
  });

  return Branch.findById(branch._id).select(BRANCH_SELECT).lean();
}

export async function getBranches({
  page = 1,
  limit = 10,
  status,
  search,
} = {}) {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { code: { $regex: escapedSearch, $options: "i" } },
      { "address.city": { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [branches, total] = await Promise.all([
    Branch.find(filter)
      .select(BRANCH_SELECT)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Branch.countDocuments(filter),
  ]);

  return {
    branches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
}

export async function getBranchById(branchId) {
  validateBranchId(branchId);

  const branch = await Branch.findById(branchId).select(BRANCH_SELECT).lean();

  if (!branch) {
    throw new AppError("Branch not found", HTTP_STATUS.NOT_FOUND);
  }

  return branch;
}

export async function updateBranch(branchId, data) {
  validateBranchId(branchId);

  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw new AppError("Branch not found", HTTP_STATUS.NOT_FOUND);
  }

  if (data.code && data.code !== branch.code) {
    const existingBranch = await Branch.findOne({
      code: data.code,
      _id: { $ne: branch._id },
    }).lean();

    if (existingBranch) {
      throw new AppError("Branch code already exists", HTTP_STATUS.CONFLICT);
    }
  }

  if (data.address) {
    branch.address = {
      ...branch.address.toObject(),
      ...data.address,
    };
  }

  for (const field of ["name", "code", "phone", "email", "status"]) {
    if (data[field] !== undefined) {
      branch[field] = data[field];
    }
  }

  await branch.save();

  return Branch.findById(branch._id).select(BRANCH_SELECT).lean();
}

export async function updateBranchStatus(branchId, status) {
  validateBranchId(branchId);

  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw new AppError("Branch not found", HTTP_STATUS.NOT_FOUND);
  }

  branch.status = status;
  await branch.save();

  return Branch.findById(branch._id).select(BRANCH_SELECT).lean();
}
