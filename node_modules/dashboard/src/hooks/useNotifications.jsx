import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as notificationService from "../services/notificationService";

// ============================================================
// Query Keys
// ============================================================
export const notificationKeys = {
  all: ["notifications"],
  list: (params) => [...notificationKeys.all, "list", params],
  unreadCount: () => [...notificationKeys.all, "unread-count"],
};

// ============================================================
// Queries
// ============================================================

/** Fetch paginated notifications */
export function useNotifications(params = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.listNotifications(params),
    select: (res) => ({
      notifications: res.data,
      pagination: res.pagination,
    }),
  });
}

/** Fetch unread notification count — polls every 30s */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadNotificationCount(),
    select: (res) => res.data?.unreadCount ?? 0,
    refetchInterval: 30000,
  });
}

// ============================================================
// Mutations
// ============================================================

/** Mark one notification as read */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/** Mark all notifications as read */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
