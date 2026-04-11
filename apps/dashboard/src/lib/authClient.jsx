import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV ? "" : "https://rekberinsaja-api-production.up.railway.app",
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
