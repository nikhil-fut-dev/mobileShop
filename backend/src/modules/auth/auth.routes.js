import { Router } from "express";
import rateLimit from "express-rate-limit";

import { asyncHandler } from "../../shared/helpers/asyncHandler.js";
import { protect } from "../../middleware/protect.js";

import { login, refresh, logout, getMe, } from "./auth.controller.js";

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

export default router;
