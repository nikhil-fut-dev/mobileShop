import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

let httpServer;
let isShuttingDown = false;

async function startServer() {
  await connectDatabase();

  httpServer = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        environment: env.NODE_ENV,
        apiPrefix: env.API_PREFIX,
      },
      "MobileShop API server started",
    );
  });
}

async function shutdown(signal) {
  if (isShuttingDown) return;

  isShuttingDown = true;
  logger.info({ signal }, "Server shutdown initiated");

  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectDatabase();

    logger.info("Server shutdown completed");
    process.exitCode = 0;
  } catch (error) {
    logger.error({ err: error }, "Server shutdown failed");
    process.exitCode = 1;
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch(async (error) => {
  logger.fatal({ err: error }, "Failed to start MobileShop API");

  try {
    await disconnectDatabase();
  } catch (disconnectError) {
    logger.error({ err: disconnectError }, "Database cleanup failed");
  }

  process.exitCode = 1;
});
