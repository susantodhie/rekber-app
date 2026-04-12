import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV ? "" : "https://rekberinsaja-api-production.up.railway.app",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => {
        const t = localStorage.getItem("sessionToken");
        return t && t !== "undefined" && t.length > 20 ? t : "";
      }
    }
  }
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
