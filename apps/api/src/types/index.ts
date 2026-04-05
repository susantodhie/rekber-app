/**
 * Shared TypeScript types
 */

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// Query Params
// ============================================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface EscrowFilterParams extends PaginationParams {
  status?: string;
  sort?: "newest" | "oldest" | "amount_high" | "amount_low";
}

export interface WalletFilterParams extends PaginationParams {
  type?: string;
}

// ============================================================
// Service Input Types
// ============================================================

export interface CreateEscrowInput {
  itemName: string;
  category: string;
  description?: string;
  counterpartyUsername: string;
  role: "buyer" | "seller";
  amount: number;
  paymentMethod?: "wallet" | "qris" | "dana";
}

export interface CreateKycInput {
  fullName: string;
  nik: string;
  birthDate: string;
}

export interface CreateWithdrawalInput {
  amount: number;
  bankAccountId: string;
  pin: string;
}

export interface CreateBankAccountInput {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  isPrimary?: boolean;
}

export interface SendMessageInput {
  content: string;
  type?: "text" | "image" | "file";
}

export interface ResolveDisputeInput {
  resolution: "resolved_buyer" | "resolved_seller";
  note: string;
}
