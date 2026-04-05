import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as walletService from "../services/walletService";

// ============================================================
// Query Keys
// ============================================================
export const walletKeys = {
  all: ["wallet"],
  balance: () => [...walletKeys.all, "balance"],
  transactions: (params) => [...walletKeys.all, "transactions", params],
  withdrawals: () => [...walletKeys.all, "withdrawals"],
  bankAccounts: () => [...walletKeys.all, "bank-accounts"],
};

// ============================================================
// Queries
// ============================================================

/** Fetch wallet balance — polls every 15s */
export function useWallet() {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: () => walletService.getWallet(),
    select: (res) => res.data,
    refetchInterval: 15000,
  });
}

/** Fetch paginated wallet transactions */
export function useWalletTransactions(params = {}) {
  return useQuery({
    queryKey: walletKeys.transactions(params),
    queryFn: () => walletService.getWalletTransactions(params),
    select: (res) => ({
      transactions: res.data,
      pagination: res.pagination,
    }),
  });
}

/** Fetch withdrawal history */
export function useWithdrawals() {
  return useQuery({
    queryKey: walletKeys.withdrawals(),
    queryFn: () => walletService.getWithdrawals(),
    select: (res) => res.data,
  });
}

/** Fetch bank accounts */
export function useBankAccounts() {
  return useQuery({
    queryKey: walletKeys.bankAccounts(),
    queryFn: () => walletService.listBankAccounts(),
    select: (res) => res.data,
  });
}

// ============================================================
// Mutations
// ============================================================

/** Top up wallet */
export function useTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => walletService.topUp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.balance() });
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions({}) });
    },
  });
}

/** Request withdrawal */
export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => walletService.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.balance() });
      queryClient.invalidateQueries({ queryKey: walletKeys.withdrawals() });
    },
  });
}

/** Add bank account */
export function useAddBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => walletService.addBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.bankAccounts() });
    },
  });
}

/** Update bank account */
export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => walletService.updateBankAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.bankAccounts() });
    },
  });
}

/** Delete bank account */
export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => walletService.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.bankAccounts() });
    },
  });
}

/** Set primary bank account */
export function useSetPrimaryBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => walletService.setPrimaryBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.bankAccounts() });
    },
  });
}

// ============================================================
// Admin Wallet Hooks
// ============================================================

/** Admin: List all withdrawals */
export function useAdminWithdrawals() {
  return useQuery({
    queryKey: [...walletKeys.all, "admin-withdrawals"],
    queryFn: () => walletService.adminListWithdrawals(),
    select: (res) => res.data,
    refetchInterval: 15000,
  });
}

/** Admin: Approve withdrawal */
export function useAdminApproveWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => walletService.adminApproveWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

/** Admin: Reject withdrawal */
export function useAdminRejectWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => walletService.adminRejectWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

