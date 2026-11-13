import mongoose from "mongoose";

import { ACCOUNT_STATUS } from "../../../shared/constants/accountStatus.js";

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    code: {
      type: String,
      required: [true, "Branch code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [
        /^[A-Z0-9-]+$/,
        "Branch code can contain only letters, numbers and hyphens",
      ],
    },

    address: {
      street: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      area: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },

      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      postalCode: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10,
      },

      country: {
        type: String,
        required: true,
        trim: true,
        default: "India",
      },
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: undefined,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 254,
      default: undefined,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    status: {
      type: String,
      enum: [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.INACTIVE],
      default: ACCOUNT_STATUS.ACTIVE,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: "__v",
    strict: true,
  },
);

branchSchema.index({ code: 1 }, { unique: true, name: "unique_branch_code" });

branchSchema.index(
  { status: 1, createdAt: -1 },
  { name: "branch_status_createdAt" },
);

const Branch = mongoose.models.Branch || mongoose.model("Branch", branchSchema);

export default Branch;
