import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";

const TOKEN_ISSUER = "mobileshop-api";
const TOKEN_AUDIENCE = "mobileshop-client";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "access",
      role: user.role,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    },
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "refresh",
    },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    },
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET, {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  });

  if (typeof payload === "string" || payload.type !== "access") {
    throw new Error("Invalid access token");
  }

  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  });

  if (typeof payload === "string" || payload.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return payload;
}
