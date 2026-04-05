import { auth } from "./src/auth/index.js";
import { db } from "./src/db/index.js";
import { user, account } from "./src/db/schema/auth.js";
import { eq } from "drizzle-orm";

async function test() {
  try {
    // We will do a native signUp from better-auth and see what it inserts!
    const result = await auth.api.signUpEmail({
      body: {
        name: "Test User",
        email: "test_native@example.com",
        password: "password123",
      }
    } as any);
    
    console.log("Signup success!");
    
    const users = await db.select().from(user).where(eq(user.email, "test_native@example.com"));
    const accounts = await db.select().from(account).where(eq(account.userId, users[0].id));
    
    console.log("User Row:", users[0]);
    console.log("Account Row:", accounts[0]);
    
    // Clean up
    await db.delete(user).where(eq(user.email, "test_native@example.com"));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
