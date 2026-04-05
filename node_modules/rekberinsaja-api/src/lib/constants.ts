/**
 * Application constants
 */

// Escrow categories (from create-escrow form)
export const ESCROW_CATEGORIES = [
  "Digital Goods & Software",
  "Physical Collectibles",
  "Domain Names",
  "Freelance Services",
  "Game Accounts",
  "Elektronik",
  "Fashion",
  "Games",
  "Kendaraan",
  "Properti",
  "Lainnya",
] as const;

// Transaction status labels (Indonesian)
export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Terkirim",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  disputed: "Sengketa",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

// KYC status labels (Indonesian)
export const KYC_STATUS_LABELS: Record<string, string> = {
  unverified: "Belum Terverifikasi",
  pending: "Menunggu Review",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Supported Indonesian banks
export const SUPPORTED_BANKS = [
  { code: "BCA", name: "Bank Central Asia" },
  { code: "BNI", name: "Bank Negara Indonesia" },
  { code: "BRI", name: "Bank Rakyat Indonesia" },
  { code: "MANDIRI", name: "Bank Mandiri" },
  { code: "CIMB", name: "CIMB Niaga" },
  { code: "DANAMON", name: "Bank Danamon" },
  { code: "PERMATA", name: "Bank Permata" },
  { code: "BSI", name: "Bank Syariah Indonesia" },
  { code: "BTN", name: "Bank Tabungan Negara" },
  { code: "MEGA", name: "Bank Mega" },
  { code: "JAGO", name: "Bank Jago" },
  { code: "SEABANK", name: "SeaBank" },
] as const;
