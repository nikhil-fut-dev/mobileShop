import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Refresh token ka SHA-256 hash; original token nahi.
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    // Ek login session ke token rotations ko group karta hai.
    familyId: {
      type: String,
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    replacedByTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },

    userAgent: {
      type: String,
      default: "",
      maxlength: 500,
    },

    ipAddress: {
      type: String,
      default: "",
      maxlength: 100,
    },
  },
  {
    timestamps: true,
    versionKey: "__v",
    strict: true,
  },
);

// Expired sessions ko MongoDB background mein delete karega.
refreshSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "refresh_session_ttl" },
);

// Ek family ke sessions ko efficiently search karne ke liye.
refreshSessionSchema.index(
  { familyId: 1, revokedAt: 1 },
  { name: "refresh_session_family_status" },
);

const RefreshSession =
  mongoose.models.RefreshSession ||
  mongoose.model("RefreshSession", refreshSessionSchema);

export default RefreshSession;
