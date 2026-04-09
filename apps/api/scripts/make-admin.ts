import { db } from "../src/db/index.js";
import { user } from "../src/db/schema/auth.js";
import { users } from "../src/db/schema/users.js";
import { eq } from "drizzle-orm";

async function makeAdmin(email: string) {
  try {
    const foundUsers = await db.select().from(user).where(eq(user.email, email));

    if (foundUsers.length === 0) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    const targetUser = foundUsers[0];

    // cek profile di table users
    const profiles = await db.select().from(users).where(eq(users.id, targetUser.id));

    if (profiles.length === 0) {
      console.error(`Profile for ${email} not found.`);
      process.exit(1);
    }

    await db.update(users)
      .set({ role: "admin" })
      .where(eq(users.id, targetUser.id));

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