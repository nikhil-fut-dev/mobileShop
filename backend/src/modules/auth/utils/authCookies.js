import { env } from "../../../config/env.js";

export const REFRESH_COOKIE_NAME = "ms_refresh";

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: `${env.API_PREFIX}/auth`,
  };
}

export function setRefreshCookie(res, token, expiresAt) {
  const maxAge = Math.max(0, expiresAt.getTime() - Date.now());

  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...getRefreshCookieOptions(),
    expires: expiresAt,
    maxAge,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
}
