import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV ? "" : "https://rekberinsaja-api-production.up.railway.app",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("sessionToken") || "",
    },
    onRequest: (context) => {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        context.request.headers.set("Authorization", `Bearer ${token}`);
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
