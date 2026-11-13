import { Router } from "express";

import healthRoutes from "../modules/health/health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import staffRoutes from "../modules/users/staff.routes.js";
import branchRoutes from "../modules/branches/branch.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", staffRoutes);
router.use("/branches", branchRoutes);

export const apiRoutes = router;
