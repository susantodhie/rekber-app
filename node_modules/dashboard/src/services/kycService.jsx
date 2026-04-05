import apiClient from "../lib/apiClient";

// ============================================================
// KYC Endpoints
// ============================================================

/** GET /api/kyc/status */
export const getKycStatus = () => apiClient.get("/kyc/status");

/** POST /api/kyc/submit — multipart (ktpFile, selfieFile + form fields) */
export const submitKyc = (formData) =>
  apiClient.post("/kyc/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ============================================================
// KYC Admin Endpoints
// ============================================================

/** GET /api/kyc/submissions — admin only, paginated */
export const listPendingKycSubmissions = (params = {}) =>
  apiClient.get("/kyc/submissions", { params });

/** POST /api/kyc/:id/approve — admin only */
export const approveKyc = (id) => apiClient.post(`/kyc/${id}/approve`);

/** POST /api/kyc/:id/reject — admin only */
export const rejectKyc = (id, reason) => apiClient.post(`/kyc/${id}/reject`, { reason });
