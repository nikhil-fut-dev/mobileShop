import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { ROLES, ROLE_VALUES } from "../../../shared/constants/roles.js";
import {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_VALUES,
} from "../../../shared/constants/accountStatus.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      default: undefined,
      maxlength: 20,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 12,
      maxlength: 72,
      select: false,
    },

    role: {
      type: String,
      enum: ROLE_VALUES,
      required: [true, "User role is required"],
    },

    status: {
      type: String,
      enum: ACCOUNT_STATUS_VALUES,
      default: ACCOUNT_STATUS.ACTIVE,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    branchIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: "__v",
    strict: true,
  },
);

// Normalize email before validation and saving.
userSchema.pre("validate", function () {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
});

// Hash password only when it changes.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  if (Buffer.byteLength(this.password, "utf8") > 72) {
    throw new Error("Password cannot exceed 72 UTF-8 bytes");
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// Verify login password.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Only one Owner account is allowed.
userSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: ROLES.OWNER,
    },
    name: "one_owner_only",
  },
);

// Phone must be unique when provided.
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    name: "unique_user_phone",
  },
);

// Useful for staff listing and filtering.
userSchema.index({ role: 1, status: 1 }, { name: "user_role_status" });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
