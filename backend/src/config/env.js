import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  API_PREFIX: z.string().default("/api/v1"),

  CLIENT_URL: z.string().url(),

  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("debug"),

  ACCESS_TOKEN_SECRET: z.string().min(32),

  REFRESH_TOKEN_SECRET: z.string().min(32),

  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),

  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Environment validation failed:");

  console.error(
    result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  );

  process.exit(1);
}

export const env = Object.freeze(result.data);
