import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "../services/userService";

// ============================================================
// Query Keys
// ============================================================
export const userKeys = {
  all: ["user"],
  profile: () => [...userKeys.all, "profile"],
  stats: () => [...userKeys.all, "stats"],
  search: (query) => [...userKeys.all, "search", query],
  byUsername: (username) => [...userKeys.all, "username", username],
};

// ============================================================
// Queries
// ============================================================

/** Fetch current user's profile */
export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userService.getMyProfile(),
    select: (res) => res.data,
  });
}

/** Fetch current user's stats (transaction counts, etc.) */
export function useMyStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userService.getMyStats(),
    select: (res) => res.data,
  });
}

/** Search users by query string */
export function useSearchUsers(query) {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () => userService.searchUsers(query),
    select: (res) => res.data,
    enabled: !!query && query.length >= 2,
  });
}

/** Get user profile by username */
export function useUserByUsername(username) {
  return useQuery({
    queryKey: userKeys.byUsername(username),
    queryFn: () => userService.getUserByUsername(username),
    select: (res) => res.data,
    enabled: !!username,
  });
}

// ============================================================
// Mutations
// ============================================================

/** Update current user's profile */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

/** Setup profile after signup */
export function useSetupProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userService.setupProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

/** Set transaction PIN */
export function useSetPin() {
  return useMutation({
    mutationFn: (pin) => userService.setTransactionPin(pin),
  });
}

/** Verify transaction PIN */
export function useVerifyPin() {
  return useMutation({
    mutationFn: (pin) => userService.verifyTransactionPin(pin),
  });
}
