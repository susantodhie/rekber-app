import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as kycService from "../services/kycService";

// ============================================================
// Query Keys
// ============================================================
export const kycKeys = {
  all: ["kyc"],
  status: () => [...kycKeys.all, "status"],
  submissions: (params) => [...kycKeys.all, "submissions", params],
};

// ============================================================
// Queries
// ============================================================

/** Fetch current user's KYC status */
export function useKycStatus() {
  return useQuery({
    queryKey: kycKeys.status(),
    queryFn: () => kycService.getKycStatus(),
    select: (res) => res.data,
  });
}

/** Fetch pending KYC submissions (admin) */
export function useKycSubmissions(params = {}) {
  return useQuery({
    queryKey: kycKeys.submissions(params),
    queryFn: () => kycService.listPendingKycSubmissions(params),
    select: (res) => res.data,
  });
}

// ============================================================
// Mutations
// ============================================================

/** Submit KYC verification (multipart form) */
export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => kycService.submitKyc(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status() });
    },
  });
}

/** Approve KYC submission (admin) */
export function useApproveKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => kycService.approveKyc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.all });
    },
  });
}

/** Reject KYC submission (admin) */
export function useRejectKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => kycService.rejectKyc(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.all });
    },
  });
}
