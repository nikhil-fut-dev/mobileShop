import mongoose from "mongoose";

import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectDatabase() {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info(
      {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      "MongoDB connected successfully",
    );
  } catch (error) {
    logger.fatal({ err: error }, "MongoDB connection failed");

    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();

  logger.info("MongoDB disconnected successfully");
}
