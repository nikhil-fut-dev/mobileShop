import pino from "pino";

import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL,

  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "authorization",
      "req.headers.authorization",
      "req.headers.cookie",
      "mongodbUri",
    ],

    censor: "[REDACTED]",
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});
