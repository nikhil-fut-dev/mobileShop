import { createHash } from "node:crypto";

export function hashToken(token) {
  if (typeof token !== "string" || token.length === 0) {
    throw new TypeError("A valid token is required");
  }

  return createHash("sha256").update(token).digest("hex");
}
