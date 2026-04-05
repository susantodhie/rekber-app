import apiClient from "../lib/apiClient";

// ============================================================
// Escrow CRUD + Lifecycle Endpoints
// ============================================================

/** POST /api/escrow */
export const createEscrow = (data) => apiClient.post("/escrow", data);

/** GET /api/escrow — paginated listing */
export const listEscrows = (params = {}) =>
  apiClient.get("/escrow", { params });

/** GET /api/escrow/:id */
export const getEscrowDetail = (id) => apiClient.get(`/escrow/${id}`);

/** POST /api/escrow/:id/pay */
export const payEscrow = (id) => apiClient.post(`/escrow/${id}/pay`);

/** POST /api/escrow/:id/ship — multipart (trackingNumber + shippingProof file) */
export const shipEscrow = (id, formData) =>
  apiClient.post(`/escrow/${id}/ship`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** POST /api/escrow/:id/confirm */
export const confirmEscrow = (id) => apiClient.post(`/escrow/${id}/confirm`);

/** POST /api/escrow/:id/cancel */
export const cancelEscrow = (id) => apiClient.post(`/escrow/${id}/cancel`);

/** POST /api/escrow/:id/dispute */
export const openDispute = (id, data) => apiClient.post(`/escrow/${id}/dispute`, data);

/** GET /api/escrow/:id/history */
export const getEscrowHistory = (id) => apiClient.get(`/escrow/${id}/history`);

/** POST /api/escrow/:id/join */
export const joinTransaction = (id) => apiClient.post(`/escrow/${id}/join`);

/** POST /api/escrow/:id/proof — multipart */
export const uploadProof = (id, formData) =>
  apiClient.post(`/escrow/${id}/proof`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** POST /api/escrow/:id/chat-start */
export const startChat = (id) => apiClient.post(`/escrow/${id}/chat-start`);

/** POST /api/escrow/:id/chat-complete */
export const completeChat = (id) => apiClient.post(`/escrow/${id}/chat-complete`);

/** POST /api/escrow/:id/approve-payment */
export const approvePayment = (id) => apiClient.post(`/escrow/${id}/approve-payment`);

/** POST /api/escrow/:id/reject-payment */
export const rejectPayment = (id, data) => apiClient.post(`/escrow/${id}/reject-payment`, data);

/** POST /api/escrow/:id/admin-join */
export const adminJoinChat = (id) => apiClient.post(`/escrow/${id}/admin-join`);
