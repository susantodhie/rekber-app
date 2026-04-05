/**
 * Fee calculator for escrow transactions
 * Based on frontend fee structure from create-escrow app
 */

const ADMIN_FEE_RATE = 0.005; // 0.5%
const INSURANCE_FEE = 5000; // Rp 5.000 fixed

export interface FeeBreakdown {
  amount: number;
  adminFee: number;
  insuranceFee: number;
  totalAmount: number;
}

/**
 * Calculate escrow transaction fees
 * @param amount - Transaction value in IDR
 */
export function calculateFees(amount: number): FeeBreakdown {
  const adminFee = Math.round(amount * ADMIN_FEE_RATE);
  const insuranceFee = INSURANCE_FEE;
  const totalAmount = amount + adminFee + insuranceFee;

  return {
    amount,
    adminFee,
    insuranceFee,
    totalAmount,
  };
}

/**
 * Preview fees without committing (for frontend display)
 */
export function previewFees(amount: number): {
  adminFeeRate: string;
  adminFee: string;
  insuranceFee: string;
  totalAmount: string;
} {
  const fees = calculateFees(amount);
  return {
    adminFeeRate: `${ADMIN_FEE_RATE * 100}%`,
    adminFee: `Rp ${fees.adminFee.toLocaleString("id-ID")}`,
    insuranceFee: `Rp ${fees.insuranceFee.toLocaleString("id-ID")}`,
    totalAmount: `Rp ${fees.totalAmount.toLocaleString("id-ID")}`,
  };
}
