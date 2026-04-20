import { db } from "../apps/api/src/db/index.js";
import { users } from "../apps/api/src/db/schema/users.js";
import { user } from "../apps/api/src/db/schema/auth.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

async function makeAdmin() {
  const email = "juniarvendi@gmail.com";
  console.log(`Checking database for user: ${email}...`);
  
  // check better-auth table
  const authUser = await db.query.user.findFirst({
    where: eq(user.email, email)
  });

  if (!authUser) {
    console.log("❌ USER NOT FOUND in better-auth. User has completely not logged in via Google.");
    process.exit(1);
  }

  // check custom users table
  const customUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!customUser) {
    console.log("⚠️ User found in Better-Auth but missing in Custom Users table (Google OAuth hook issue).");
    console.log("Creating user manually in the custom users table...");
    
    const hashedPassword = await bcrypt.hash(authUser.id, 10);
    const hashedPin = await bcrypt.hash("000000", 10);
    
    await db.insert(users).values({
      id: crypto.randomUUID(),
      email: authUser.email,
      password: hashedPassword,
      transactionPin: hashedPin,
      role: "admin", // set them as admin immediately
      kycStatus: "pending",
      createdAt: authUser.createdAt || new Date(),
    });
    console.log("✅ Success! The user has been synced and granted ADMIN access.");
    process.exit(0);
  }

  console.log(`Found custom user. Current role: ${customUser.role}`);
  
  if (customUser.role === "admin") {
    console.log("✅ User is already an admin!");
    process.exit(0);
  }

  await db.update(users)
    .set({ role: "admin" })
    .where(eq(users.email, email));

  console.log("✅ Success! The user has been granted ADMIN access.");
  process.exit(0);
}

makeAdmin().catch(console.error);
