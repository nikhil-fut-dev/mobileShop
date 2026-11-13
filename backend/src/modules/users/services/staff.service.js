import mongoose from "mongoose";

import User from "../models/User.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { ACCOUNT_STATUS } from "../../../shared/constants/accountStatus.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus.js";
import RefreshSession from "../../auth/models/RefreshSession.js";

const STAFF_ROLES = [ROLES.ADMIN, ROLES.CASHIER];

const STAFF_SELECT =
  "fullName email phone role status isEmailVerified isPhoneVerified branchIds createdBy lastLoginAt createdAt updatedAt";

class StaffService {
  async createStaff(data, createdBy) {
    const existingUser = await User.findOne({
      email: data.email.toLowerCase().trim(),
    }).select("_id");

    if (existingUser) {
      throw new AppError(
        "A user with this email already exists",
        HTTP_STATUS.CONFLICT,
      );
    }

    if (data.phone) {
      const existingPhone = await User.findOne({
        phone: data.phone,
      }).select("_id");

      if (existingPhone) {
        throw new AppError(
          "A user with this phone number already exists",
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    const staff = await User.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
      role: data.role,
      branchIds: data.branchIds || [],
      status: ACCOUNT_STATUS.ACTIVE,
      createdBy,
    });

    return User.findById(staff._id).select(STAFF_SELECT);
  }

  async getStaff(query = {}) {
    const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(query.limit, 10) || 10, 1),
      100,
    );

    const filter = {
      role: { $in: STAFF_ROLES },
    };

    if (query.role && STAFF_ROLES.includes(query.role)) {
      filter.role = query.role;
    }

    if (query.status && Object.values(ACCOUNT_STATUS).includes(query.status)) {
      filter.status = query.status;
    }

    const [staff, total] = await Promise.all([
      User.find(filter)
        .select(STAFF_SELECT)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return {
      staff,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async getStaffById(userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError("Invalid staff ID", HTTP_STATUS.BAD_REQUEST);
    }

    const staff = await User.findOne({
      _id: userId,
      role: { $in: STAFF_ROLES },
    }).select(STAFF_SELECT);

    if (!staff) {
      throw new AppError("Staff member not found", HTTP_STATUS.NOT_FOUND);
    }

    return staff;
  }

  async updateStaff(userId, data) {
    const staff = await User.findOne({
      _id: userId,
      role: { $in: STAFF_ROLES },
    });

    if (!staff) {
      throw new AppError("Staff member not found", HTTP_STATUS.NOT_FOUND);
    }

    if (data.email) {
      const existingEmail = await User.findOne({
        email: data.email.toLowerCase().trim(),
        _id: { $ne: staff._id },
      }).select("_id");

      if (existingEmail) {
        throw new AppError(
          "A user with this email already exists",
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    if (data.phone) {
      const existingPhone = await User.findOne({
        phone: data.phone,
        _id: { $ne: staff._id },
      }).select("_id");

      if (existingPhone) {
        throw new AppError(
          "A user with this phone number already exists",
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    if (data.fullName !== undefined) staff.fullName = data.fullName;
    if (data.email !== undefined) staff.email = data.email;
    if (data.phone !== undefined) staff.phone = data.phone || undefined;
    if (data.role !== undefined) staff.role = data.role;
    if (data.branchIds !== undefined) staff.branchIds = data.branchIds;

    await staff.save();

    return User.findById(staff._id).select(STAFF_SELECT);
  }

  async updateStaffStatus(userId, status) {
    const staff = await User.findOne({
      _id: userId,
      role: { $in: STAFF_ROLES },
    });

    if (!staff) {
      throw new AppError("Staff member not found", HTTP_STATUS.NOT_FOUND);
    }

    staff.status = status;
    await staff.save();

    // Revoke all refresh sessions when staff is disabled.
    if (
      status === ACCOUNT_STATUS.INACTIVE ||
      status === ACCOUNT_STATUS.SUSPENDED
    ) {
      await RefreshSession.updateMany(
        {
          user: staff._id,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt: new Date(),
          },
        },
      );
    }

    return User.findById(staff._id).select(STAFF_SELECT);
  }
}

export default new StaffService();
