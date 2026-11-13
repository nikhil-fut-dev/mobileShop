import { ROLE_PERMISSIONS } from "../constants/rolePermissions.js";

export function hasPermission(role, requiredPermissions = []) {
  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) {
    return false;
  }

  if (permissions.includes("*")) {
    return true;
  }

  return requiredPermissions.every((permission) =>
    permissions.includes(permission),
  );
}
