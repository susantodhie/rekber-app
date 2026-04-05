import { db } from "../src/db/index.js";
import { user } from "../src/db/schema/auth.js";
import { userProfiles } from "../src/db/schema/users.js";
import { eq } from "drizzle-orm";

async function makeAdmin(email: string) {
  try {
    const users = await db.select().from(user).where(eq(user.email, email));
    if (users.length === 0) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }
    
    const targetUser = users[0];
    
    // Check if profile exists
    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, targetUser.id));
    if (profiles.length === 0) {
      console.error(`Profile for ${email} not found. Please log in normally once to create a profile before making them an admin.`);
      process.exit(1);
    }

    await db.update(userProfiles).set({ role: "admin" }).where(eq(userProfiles.userId, targetUser.id));
    console.log(`✅ Successfully promoted ${email} to admin!`);
    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error("❌ Please provide an email address.");
  console.error("Usage: npx tsx scripts/make-admin.ts <email>");
  process.exit(1);
}

makeAdmin(email);
