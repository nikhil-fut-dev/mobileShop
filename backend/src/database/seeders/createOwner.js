import mongoose from "mongoose";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import User from "../../modules/users/models/User.js";
import { ROLES } from "../../shared/constants/roles.js";
import { ACCOUNT_STATUS } from "../../shared/constants/accountStatus.js";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

async function ask(question) {
  return (await rl.question(question)).trim();
}

async function main() {
  try {
    console.log("\n=== MobileShop Owner Bootstrap ===\n");

    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);

    logger.info("MongoDB connected");

    // Check whether Owner already exists
    const existingOwner = await User.findOne({
      role: ROLES.OWNER,
    }).lean();

    if (existingOwner) {
      console.log("An Owner account already exists.");
      console.log("Bootstrap cancelled.");
      return;
    }

    // Collect Owner information
    const fullName = await ask("Owner full name: ");
    const email = (await ask("Owner email: ")).toLowerCase();
    const phone = await ask("Owner phone (optional): ");
    const password = await ask("Owner password (minimum 12 characters): ");
    const confirmPassword = await ask("Confirm password: ");

    // Validate required inputs
    if (!fullName || !email || !password) {
      throw new Error("Name, email and password are required.");
    }

    if (password.length < 12) {
      throw new Error("Password must contain at least 12 characters.");
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      throw new Error("Password cannot exceed 72 UTF-8 bytes.");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    // Check email duplication
    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      throw new Error("This email is already registered.");
    }
   

    // Create Owner
    const owner = await User.create({
      fullName,
      email,
      phone: phone || undefined,
      password,
      role: ROLES.OWNER,
      status: ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: false,
    });

    console.log("\nOwner account created successfully.");
    console.log("Owner ID:", owner._id.toString());
    console.log("Email:", owner.email);
    console.log("Role:", owner.role);
    console.log("\nKeep your credentials secure.");
  } catch (error) {
    logger.error({ err: error }, "Owner bootstrap failed");
    throw error;
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main().catch(() => {
  process.exitCode = 1;
});
