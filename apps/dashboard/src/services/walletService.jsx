const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Core fetch wrapper logic specifically tailored for Wallet
 * It ensures we always send session credentials and parses responses safely.
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    // Gracefully handle both absolute and relative API URLs
    const url = new URL(`${API_URL}${endpoint}`, window.location.origin);
    
    // Add query params if provided
    if (options.params) {
      Object.keys(options.params).forEach((key) => {
        if (options.params[key] !== undefined && options.params[key] !== null) {
          url.searchParams.append(key, options.params[key]);
        }
      });
    }

    const res = await fetch(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      // CRITICAL: Required for cookie-based auth in cross-origin environments
      credentials: "include", 
    });

    let data;
    try {
      // Cleanly parse JSON
      data = await res.json();
    } catch (parseError) {
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return null; // Empty responses
    }

    // React query relies on thrown errors to trigger error boundaries/states
    if (!res.ok) {
      const errorMessage = data?.message || data?.error || res.statusText || 'API request failed';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`[walletService] Error in ${endpoint}:`, error);
    throw error;
  }
};

// ============================================================
// Wallet Endpoints
// ============================================================

/** GET /api/wallet */
export const getWallet = () => fetchAPI("/wallet", { method: "GET" });

/** GET /api/wallet/transactions — paginated */
export const getWalletTransactions = (params = {}) =>
  fetchAPI("/wallet/transactions", { method: "GET", params });

/** POST /api/wallet/withdraw */
export const requestWithdrawal = (data) =>
  fetchAPI("/wallet/withdraw", { method: "POST", body: JSON.stringify(data) });

/** POST /api/wallet/topup */
export const topUp = (data) =>
  fetchAPI("/wallet/topup", { method: "POST", body: JSON.stringify(data) });

/** GET /api/wallet/withdrawals */
export const getWithdrawals = () => fetchAPI("/wallet/withdrawals", { method: "GET" });

/** GET /api/wallet/admin/withdrawals */
export const adminListWithdrawals = () => fetchAPI("/wallet/admin/withdrawals", { method: "GET" });

/** POST /api/wallet/admin/withdrawals/:id/approve */
export const adminApproveWithdrawal = (id) =>
  fetchAPI(`/wallet/admin/withdrawals/${id}/approve`, { method: "POST" });

/** POST /api/wallet/admin/withdrawals/:id/reject */
export const adminRejectWithdrawal = (id) =>
  fetchAPI(`/wallet/admin/withdrawals/${id}/reject`, { method: "POST" });


// ============================================================
// Bank Account Endpoints
// ============================================================

/** GET /api/wallet/bank-accounts */
export const listBankAccounts = () => fetchAPI("/wallet/bank-accounts", { method: "GET" });

/** POST /api/wallet/bank-accounts */
export const addBankAccount = (data) =>
  fetchAPI("/wallet/bank-accounts", { method: "POST", body: JSON.stringify(data) });

/** PUT /api/wallet/bank-accounts/:id */
export const updateBankAccount = (id, data) =>
  fetchAPI(`/wallet/bank-accounts/${id}`, { method: "PUT", body: JSON.stringify(data) });

/** DELETE /api/wallet/bank-accounts/:id */
export const deleteBankAccount = (id) =>
  fetchAPI(`/wallet/bank-accounts/${id}`, { method: "DELETE" });

/** POST /api/wallet/bank-accounts/:id/set-primary */
export const setPrimaryBankAccount = (id) =>
  fetchAPI(`/wallet/bank-accounts/${id}/set-primary`, { method: "POST" });
