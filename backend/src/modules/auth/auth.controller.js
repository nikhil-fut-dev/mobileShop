import { randomUUID } from "node:crypto";
import { z } from "zod";

import User from "../users/models/User.js";
import RefreshSession from "./models/RefreshSession.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./services/tokenService.js";

import { hashToken } from "./utils/tokenHash.js";
import {
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  clearRefreshCookie,
} from "./utils/authCookies.js";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

function getRefreshExpiry(payload) {
  if (!payload.exp) {
    throw new Error("Refresh token expiry is missing");
  }

  return new Date(payload.exp * 1000);
}

// POST /auth/login
export async function login(req, res) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid login details",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { email, password } = validation.data;

  const user = await User.findOne({ email }).select("+password");

  // Same response for unknown email and incorrect password.
  if (!user) {
    return sendError(res, 401, "Invalid email or password");
  }

  const now = new Date();

  if (user.lockUntil && user.lockUntil > now) {
    return sendError(
      res,
      423,
      "Account temporarily locked. Please try again later.",
    );
  }

  if (user.status !== "active") {
    return sendError(res, 403, "This account is not active");
  }

  // Reset an expired lock before checking the password.
  if (user.lockUntil && user.lockUntil <= now) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await user.save();

    return sendError(res, 401, "Invalid email or password");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = now;

  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshPayload = verifyRefreshToken(refreshToken);
  const expiresAt = getRefreshExpiry(refreshPayload);

  const tokenHash = hashToken(refreshToken);

  await RefreshSession.create({
    user: user._id,
    tokenHash,
    familyId: randomUUID(),
    expiresAt,
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip || "",
  });

  setRefreshCookie(res, refreshToken, expiresAt);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchIds: user.branchIds,
      },
    },
  });
}

// POST /auth/refresh
export async function refresh(req, res) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    return sendError(res, 401, "Refresh token is missing");
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    clearRefreshCookie(res);
    return sendError(res, 401, "Invalid or expired refresh token");
  }

  const now = new Date();
  const tokenHash = hashToken(refreshToken);

  const session = await RefreshSession.findOne({ tokenHash })
    .select("+tokenHash")
    .populate({
      path: "user",
      select: "fullName email role status branchIds",
    });

  if (!session) {
    clearRefreshCookie(res);
    return sendError(res, 401, "Session not found");
  }

  // A revoked token being presented again indicates possible token reuse.
  if (session.revokedAt) {
    await RefreshSession.updateMany(
      { familyId: session.familyId, revokedAt: null },
      { $set: { revokedAt: now } },
    );

    clearRefreshCookie(res);
    return sendError(res, 401, "Session reuse detected. Please login again.");
  }

  if (session.expiresAt <= now || !session.user) {
    await RefreshSession.updateOne(
      { _id: session._id, revokedAt: null },
      { $set: { revokedAt: now } },
    );

    clearRefreshCookie(res);
    return sendError(res, 401, "Session expired");
  }

  if (session.user.status !== "active") {
    await RefreshSession.updateMany(
      { familyId: session.familyId, revokedAt: null },
      { $set: { revokedAt: now } },
    );

    clearRefreshCookie(res);
    return sendError(res, 403, "This account is not active");
  }

  const newRefreshToken = generateRefreshToken(session.user);
  const newPayload = verifyRefreshToken(newRefreshToken);
  const newExpiresAt = getRefreshExpiry(newPayload);
  const newTokenHash = hashToken(newRefreshToken);

  // Atomically revoke the old token. Only one concurrent refresh can win.
  const rotation = await RefreshSession.updateOne(
    {
      _id: session._id,
      revokedAt: null,
      expiresAt: { $gt: now },
    },
    {
      $set: {
        revokedAt: now,
        replacedByTokenHash: newTokenHash,
        lastUsedAt: now,
      },
    },
  );

  if (rotation.modifiedCount !== 1) {
    // Another request may have rotated this token already.
    await RefreshSession.updateMany(
      { familyId: session.familyId, revokedAt: null },
      { $set: { revokedAt: now } },
    );

    clearRefreshCookie(res);
    return sendError(
      res,
      401,
      "Refresh token reuse detected. Please login again.",
    );
  }

  await RefreshSession.create({
    user: session.user._id,
    tokenHash: newTokenHash,
    familyId: session.familyId,
    expiresAt: newExpiresAt,
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip || "",
  });

  const accessToken = generateAccessToken(session.user);

  setRefreshCookie(res, newRefreshToken, newExpiresAt);

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken,
    },
  });
}

// POST /auth/logout
export async function logout(req, res) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);

    await RefreshSession.updateOne(
      { tokenHash, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  clearRefreshCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    message: "Authenticated user fetched successfully",
    data: {
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        branchIds: req.user.branchIds,
      },
    },
  });
}
