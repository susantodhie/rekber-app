import apiClient from "../lib/apiClient";

// ============================================================
// Admin Panel Endpoints (requires admin role)
// ============================================================

/** GET /api/admin/dashboard */
export const getAdminDashboard = () => apiClient.get("/admin/dashboard");

/** GET /api/admin/disputes — paginated */
export const listDisputes = (params = {}) =>
  apiClient.get("/admin/disputes", { params });

/** POST /api/admin/disputes/:id/resolve */
export const resolveDispute = (id, data) =>
  apiClient.post(`/admin/disputes/${id}/resolve`, data);

/** GET /api/admin/withdrawals */
export const getPendingWithdrawals = () => apiClient.get("/admin/withdrawals");

/** POST /api/admin/withdrawals/:id/process */
export const processWithdrawal = (id, approve) =>
  apiClient.post(`/admin/withdrawals/${id}/process`, { approve });

/** GET /api/admin/activity-log — paginated */
export const getActivityLog = (params = {}) =>
  apiClient.get("/admin/activity-log", { params });

/** GET /api/admin/transactions — paginated */
export const listTransactions = (params = {}) =>
  apiClient.get("/admin/transactions", { params });
