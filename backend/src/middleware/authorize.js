import { AppError } from "../shared/errors/AppError.js";
import { HTTP_STATUS } from "../shared/constants/httpStatus.js";
import { hasPermission } from "../shared/helpers/hasPermission.js";

export function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return next(
        new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have access to this resource",
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    next();
  };
}

export function requirePermission(...requiredPermissions) {
  return function (req, res, next) {
    if (!req.user) {
      return next(
        new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED),
      );
    }

    if (
      requiredPermissions.length === 0 ||
      !hasPermission(req.user.role, requiredPermissions)
    ) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    next();
  };
}
