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

    const accessToken = authorization.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
    }

    let payload;

    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    const user = await User.findById(payload.sub).select(
      "fullName email role status branchIds",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // Authenticated user available to subsequent middleware/controllers.
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
