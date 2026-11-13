import { Router } from "express";
import rateLimit from "express-rate-limit";

import { asyncHandler } from "../../shared/helpers/asyncHandler.js";
import { protect } from "../../middleware/protect.js";

import { ROLES } from "../../shared/constants/roles.js";
import { requireRole } from "../../middleware/authorize.js";

import { login, refresh, logout, getMe } from "./auth.controller.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many refresh requests. Please try again later.",
  },
});

router.post("/login", loginLimiter, asyncHandler(login));
router.post("/refresh", refreshLimiter, asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

router.get("/me", protect, asyncHandler(getMe));

// Temporary RBAC testing routes
router.get("/test/owner", protect, requireRole(ROLES.OWNER), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Owner access granted",
    role: req.user.role,
  });
});

router.get("/test/admin", protect, requireRole(ROLES.ADMIN), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    role: req.user.role,
  });
});

router.get("/test/cashier", protect, requireRole(ROLES.CASHIER), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cashier access granted",
    role: req.user.role,
  });
});

export default router;
