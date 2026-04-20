import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema/index.js";
import "dotenv/config";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "https://rekberinsaja-api-production.up.railway.app",

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const { eq } = await import("drizzle-orm");
            const bcrypt = await import("bcrypt");
            
            const existing = await db.select().from(schema.users).where(eq(schema.users.email, user.email)).limit(1);
            if (existing.length === 0) {
              const hashedPassword = await bcrypt.hash(user.id, 10);
              const hashedPin = await bcrypt.hash("000000", 10);
              
              await db.insert(schema.users).values({
                id: crypto.randomUUID(),
                email: user.email,
                password: hashedPassword,
                transactionPin: hashedPin,
                role: "user",
                kycStatus: "pending",
                createdAt: user.createdAt || new Date(),
              });
            }
          } catch (e) {
            console.error("Error syncing Google user to custom users table:", e);
          }
        }
      }
    }
  },


  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        secure: true, // Wajib true saat deploy
        sameSite: "none", // Wajib none untuk cross-site (dashboard & api terpisah)
      },
    },
  },

  // 🔥 TAMBAHIN HOPPSCOTCH
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "https://hoppscotch.io",
    "https://dashboard-production-eee6.up.railway.app",
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password: string) => {
        const bcrypt = await import("bcryptjs");
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        const bcrypt = await import("bcryptjs");
        return await bcrypt.compare(password, hash);
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET
      ),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    additionalFields: {},
  },
});

export type Session = typeof auth.$Infer.Session;