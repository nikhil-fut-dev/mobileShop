import mongoose from "mongoose";

import User from "../modules/users/models/User.js";
import { verifyAccessToken } from "../modules/auth/services/tokenService.js";

export async function protect(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken || accessToken.includes(" ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token format.",
      });
    }

    let payload;

    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    if (
      !payload ||
      payload.type !== "access" ||
      typeof payload.sub !== "string" ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token payload.",
      });
    }

    const user = await User.findById(payload.sub).select(
      "fullName email role status branchIds",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message:
          "Your account is inactive or suspended. Please contact the Owner.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
