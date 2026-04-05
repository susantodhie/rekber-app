import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as escrowService from "../services/escrowService";
import { walletKeys } from "./useWallet";

// ============================================================
// Query Keys
// ============================================================
export const escrowKeys = {
  all: ["escrow"],
  list: (params) => [...escrowKeys.all, "list", params],
  detail: (id) => [...escrowKeys.all, "detail", id],
  history: (id) => [...escrowKeys.all, "history", id],
};

// ============================================================
// Queries
// ============================================================

/** Fetch paginated escrow list */
export function useEscrowList(params = {}) {
  return useQuery({
    queryKey: escrowKeys.list(params),
    queryFn: () => escrowService.listEscrows(params),
    select: (res) => ({
      transactions: res.data,
      pagination: res.pagination,
    }),
    refetchInterval: 10000,
  });
}

/** Fetch single escrow detail */
export function useEscrowDetail(id) {
  return useQuery({
    queryKey: escrowKeys.detail(id),
    queryFn: () => escrowService.getEscrowDetail(id),
    select: (res) => res.data,
    enabled: !!id,
    refetchInterval: 8000,
  });
}

/** Fetch escrow status history */
export function useEscrowHistory(id) {
  return useQuery({
    queryKey: escrowKeys.history(id),
    queryFn: () => escrowService.getEscrowHistory(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// ============================================================
// Mutations
// ============================================================

/** Create new escrow */
export function useCreateEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => escrowService.createEscrow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
      // Also invalidate wallet to reflect balance changes for wallet payments
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

/** Buyer pays for escrow */
export function usePayEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => escrowService.payEscrow(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

/** Seller ships escrow item */
export function useShipEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => escrowService.shipEscrow(id, formData),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/** Buyer confirms receipt */
export function useConfirmEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => escrowService.confirmEscrow(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

/** Cancel escrow */
export function useCancelEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => escrowService.cancelEscrow(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

/** Open dispute on escrow */
export function useOpenDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => escrowService.openDispute(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/** Join Transaction */
export function useJoinTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => escrowService.joinTransaction(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/** Upload Escrow Proof */
export function useUploadProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => escrowService.uploadProof(id, formData),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/** Start Chat */
export function useStartChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => escrowService.startChat(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/** Complete Chat (Success) */
export function useCompleteChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => escrowService.completeChat(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

/** Admin Approve Payment */
export function useApprovePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => escrowService.approvePayment(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/** Admin Reject Payment */
export function useRejectPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => escrowService.rejectPayment(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/** Admin Join Chat */
export function useAdminJoinChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => escrowService.adminJoinChat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
