import apiClient from "../lib/apiClient";

// ============================================================
// User Profile Endpoints
// ============================================================

/** GET /api/users/me */
export const getMyProfile = () => apiClient.get("/users/me");

/** PUT /api/users/me */
export const updateMyProfile = (data) => apiClient.put("/users/me", data);

/** GET /api/users/me/stats */
export const getMyStats = () => apiClient.get("/users/me/stats");

/** GET /api/users/search?q= */
export const searchUsers = (query) => apiClient.get("/users/search", { params: { q: query } });

/** GET /api/users/:username */
export const getUserByUsername = (username) => apiClient.get(`/users/${username}`);

// ============================================================
// Auth Extension Endpoints
// ============================================================

/** POST /api/auth/setup-profile */
export const setupProfile = () => apiClient.post("/auth/setup-profile");

/** POST /api/auth/set-pin */
export const setTransactionPin = (pin) => apiClient.post("/auth/set-pin", { pin });

/** POST /api/auth/verify-pin */
export const verifyTransactionPin = (pin) => apiClient.post("/auth/verify-pin", { pin });
