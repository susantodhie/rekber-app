import apiClient from "../lib/apiClient";

// ============================================================
// Message / Conversation Endpoints
// ============================================================

/** GET /api/conversations */
export const listConversations = () => apiClient.get("/conversations");

/** GET /api/conversations/unread-count */
export const getUnreadCount = () => apiClient.get("/conversations/unread-count");

/** GET /api/conversations/:id — paginated messages */
export const getConversationMessages = (id, params = {}) =>
  apiClient.get(`/conversations/${id}`, { params });

/** POST /api/conversations/:id/messages — multipart (content + optional file) */
export const sendMessage = (conversationId, formData) =>
  apiClient.post(`/conversations/${conversationId}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Send text-only message (convenience helper) */
export const sendTextMessage = (conversationId, content) =>
  apiClient.post(`/conversations/${conversationId}/messages`, { content, type: "text" });

/** POST /api/conversations/:id/read */
export const markConversationRead = (id) => apiClient.post(`/conversations/${id}/read`);
