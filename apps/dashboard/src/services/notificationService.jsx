import apiClient from "../lib/apiClient";

// ============================================================
// Notification Endpoints
// ============================================================

/** GET /api/notifications — paginated */
export const listNotifications = (params = {}) =>
  apiClient.get("/notifications", { params });

/** GET /api/notifications/unread-count */
export const getUnreadNotificationCount = () =>
  apiClient.get("/notifications/unread-count");

/** POST /api/notifications/:id/read */
export const markNotificationRead = (id) =>
  apiClient.post(`/notifications/${id}/read`);

/** POST /api/notifications/read-all */
export const markAllNotificationsRead = () =>
  apiClient.post("/notifications/read-all");
