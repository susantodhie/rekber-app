import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "../services/adminService";

// ============================================================
// Query Keys
// ============================================================
export const adminKeys = {
  all: ["admin"],
  dashboard: () => [...adminKeys.all, "dashboard"],
  disputes: (params) => [...adminKeys.all, "disputes", params],
  withdrawals: () => [...adminKeys.all, "withdrawals"],
  activityLog: (params) => [...adminKeys.all, "activity-log", params],
  transactions: (params) => [...adminKeys.all, "transactions", params],
};

// ============================================================
// Queries
// ============================================================

/** Fetch admin dashboard stats */
export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminService.getAdminDashboard(),
    select: (res) => res.data,
  });
}

/** Fetch paginated disputes */
export function useDisputes(params = {}) {
  return useQuery({
    queryKey: adminKeys.disputes(params),
    queryFn: () => adminService.listDisputes(params),
    select: (res) => ({
      disputes: res.data,
      pagination: res.pagination,
    }),
  });
}

/** Fetch pending withdrawals */
export function usePendingWithdrawals() {
  return useQuery({
    queryKey: adminKeys.withdrawals(),
    queryFn: () => adminService.getPendingWithdrawals(),
    select: (res) => res.data,
  });
}

/** Fetch activity log */
export function useActivityLog(params = {}) {
  return useQuery({
    queryKey: adminKeys.activityLog(params),
    queryFn: () => adminService.getActivityLog(params),
    select: (res) => res.data,
  });
}

/** Fetch all transactions (Admin view) */
export function useAdminTransactions(params = {}) {
  return useQuery({
    queryKey: adminKeys.transactions(params),
    queryFn: () => adminService.listTransactions(params),
    select: (res) => ({
      transactions: res.data,
      pagination: res.pagination,
    }),
  });
}

// ============================================================
// Mutations
// ============================================================

/** Resolve a dispute */
export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminService.resolveDispute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.disputes({}) });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

/** Process withdrawal (approve/reject) */
export function useProcessWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }) => adminService.processWithdrawal(id, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.withdrawals() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}
