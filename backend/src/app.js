import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { apiRoutes } from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-to-server).
      if (!origin || origin === env.CLIENT_URL) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(cookieParser());

// HTTP request logging
app.use(pinoHttp({ logger }));

// Prevent HTTP parameter pollution
app.use(hpp());

// Request body size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(env.API_PREFIX, apiLimiter);

// API routes
app.use(env.API_PREFIX, apiRoutes);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;
