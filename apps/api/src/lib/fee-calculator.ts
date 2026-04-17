/**
 * Fee calculator for escrow transactions
 * Upgraded with multi-tier logic and payment gateway specific fees
 */

export interface FeeBreakdown {
  amount: number;
  rekberFee: number;
  adminFee: number;
  totalAmount: number;
}

/**
 * Validates transaction amount limit
 */
export function validateAmount(amount: number) {
  if (amount > 3000000) {
    throw new Error("Maaf kak, maksimal transaksi hanya Rp3.000.000 🙏");
  }
}

/**
 * Calculate escrow transaction fees
 * @param amount - Transaction value in IDR
 * @param paymentMethod - e.g. "qris", "dana", "va"
 */
export function calculateFees(amount: number, paymentMethod?: string): FeeBreakdown {
  // 1. Calculate Fee Rekber
  let rekberFee = 0;
  if (amount < 250000) {
    rekberFee = 5000;
  } else if (amount >= 250000 && amount <= 1000000) {
    rekberFee = 10000;
  } else {
    // > 1.000.000
    const rawFee = amount * 0.015;
    rekberFee = Math.min(Math.round(rawFee), 25000);
  }

  // 2. Calculate Admin Fee (Payment Gateway)
  let adminFee = 0;
  if (paymentMethod) {
    const methodStr = paymentMethod.toLowerCase();
    if (methodStr === "qris") {
      adminFee = Math.round(amount * 0.007); // 0.7%
    } else if (["dana", "ovo", "shopeepay", "linkaja", "ewallet"].includes(methodStr)) {
      adminFee = Math.round(amount * 0.015); // 1.5%
    } else {
      // Default fallback (VA / Bank Transfer)
      adminFee = 5000;
    }
  }

  const totalAmount = amount + rekberFee + adminFee;

  return {
    amount,
    rekberFee,
    adminFee,
    totalAmount,
  };
}

/**
 * Preview fees without committing (for frontend display or logic fallback)
 */
export function previewFees(amount: number, paymentMethod?: string) {
  const fees = calculateFees(amount, paymentMethod);
  return {
    rekberFee: `Rp ${fees.rekberFee.toLocaleString("id-ID")}`,
    adminFee: `Rp ${fees.adminFee.toLocaleString("id-ID")}`,
    totalAmount: `Rp ${fees.totalAmount.toLocaleString("id-ID")}`,
  };
}
