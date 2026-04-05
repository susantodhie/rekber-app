import apiClient from "../lib/apiClient";

// ============================================================
// Wallet Endpoints
// ============================================================

/** GET /api/wallet */
export const getWallet = () => apiClient.get("/wallet");

/** GET /api/wallet/transactions — paginated */
export const getWalletTransactions = (params = {}) =>
  apiClient.get("/wallet/transactions", { params });

/** POST /api/wallet/withdraw */
export const requestWithdrawal = (data) => apiClient.post("/wallet/withdraw", data);

/** POST /api/wallet/topup */
export const topUp = (data) => apiClient.post("/wallet/topup", data);

/** GET /api/wallet/withdrawals */
export const getWithdrawals = () => apiClient.get("/wallet/withdrawals");

/** GET /api/wallet/admin/withdrawals */
export const adminListWithdrawals = () => apiClient.get("/wallet/admin/withdrawals");

/** POST /api/wallet/admin/withdrawals/:id/approve */
export const adminApproveWithdrawal = (id) => apiClient.post(`/wallet/admin/withdrawals/${id}/approve`);

/** POST /api/wallet/admin/withdrawals/:id/reject */
export const adminRejectWithdrawal = (id) => apiClient.post(`/wallet/admin/withdrawals/${id}/reject`);


// ============================================================
// Bank Account Endpoints
// ============================================================

/** GET /api/wallet/bank-accounts */
export const listBankAccounts = () => apiClient.get("/wallet/bank-accounts");

/** POST /api/wallet/bank-accounts */
export const addBankAccount = (data) => apiClient.post("/wallet/bank-accounts", data);

/** PUT /api/wallet/bank-accounts/:id */
export const updateBankAccount = (id, data) => apiClient.put(`/wallet/bank-accounts/${id}`, data);

/** DELETE /api/wallet/bank-accounts/:id */
export const deleteBankAccount = (id) => apiClient.delete(`/wallet/bank-accounts/${id}`);

/** POST /api/wallet/bank-accounts/:id/set-primary */
export const setPrimaryBankAccount = (id) => apiClient.post(`/wallet/bank-accounts/${id}/set-primary`);
