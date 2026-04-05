import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as messageService from "../services/messageService";

// ============================================================
// Query Keys
// ============================================================
export const messageKeys = {
  all: ["messages"],
  conversations: () => [...messageKeys.all, "conversations"],
  unreadCount: () => [...messageKeys.all, "unread-count"],
  messages: (id, params) => [...messageKeys.all, "messages", id, params],
};

// ============================================================
// Queries
// ============================================================

/** Fetch all conversations */
export function useConversations() {
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: () => messageService.listConversations(),
    select: (res) => res.data,
  });
}

/** Fetch unread message count — polls every 30s */
export function useUnreadMessageCount() {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: () => messageService.getUnreadCount(),
    select: (res) => res.data?.unreadCount ?? 0,
    refetchInterval: 30000,
  });
}

/** Fetch messages for a conversation */
export function useConversationMessages(id, params = {}) {
  return useQuery({
    queryKey: messageKeys.messages(id, params),
    queryFn: () => messageService.getConversationMessages(id, params),
    select: (res) => ({
      messages: res.data,
      pagination: res.pagination,
    }),
    enabled: !!id,
  });
}

// ============================================================
// Mutations
// ============================================================

/** Send a text message */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }) =>
      messageService.sendTextMessage(conversationId, content),
    onSuccess: (_data, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId, {}) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

/** Send a message with file attachment */
export function useSendFileMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, formData }) =>
      messageService.sendMessage(conversationId, formData),
    onSuccess: (_data, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId, {}) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

/** Mark a conversation as read */
export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => messageService.markConversationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}
