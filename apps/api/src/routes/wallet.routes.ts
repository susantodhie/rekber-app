import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { z } from "zod";
import * as walletService from "../services/wallet.service.js";
import * as bankAccountService from "../services/bank-account.service.js";
import { requireKyc } from "../middleware/kyc.middleware.js";
import { getParam, getQueryInt, getQuery } from "../lib/request-helpers.js";

const router = Router();

// ============================================================
// Wallet endpoints
// ============================================================

/**
 * GET /api/wallet
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user!.id);
    if (!wallet) {
      res.status(404).json({ success: false, error: "Wallet not found" });
      return;
    }
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/wallet/transactions
 */
router.get("/transactions", requireAuth, async (req, res, next) => {
  try {
    const params = {
      page: getQueryInt(req, "page", 1),
      pageSize: getQueryInt(req, "pageSize", 10),
      type: getQuery(req, "type"),
    };
    const result = await walletService.getWalletTransactions(req.user!.id, params);
    res.json({
      success: true,
      data: result.transactions,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wallet/withdraw
 */
const withdrawSchema = z.object({
  amount: z.number().positive().min(50000, "Minimum withdrawal: Rp 50.000"),
  bankAccountId: z.string().uuid(),
  pin: z.string().length(6),
});

router.post("/withdraw", requireAuth, requireKyc, validate(withdrawSchema), async (req, res, next) => {
  try {
    const withdrawal = await walletService.requestWithdrawal(req.user!.id, req.body);
    res.status(201).json({ success: true, data: withdrawal });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wallet/topup
 */
const topUpSchema = z.object({
  amount: z.number().positive().min(10000, "Minimum top up: Rp 10.000"),
  method: z.string().min(1),
});

router.post("/topup", requireAuth, validate(topUpSchema), async (req, res, next) => {
  try {
    const result = await walletService.topUpWallet(req.user!.id, req.body.amount, req.body.method);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/wallet/withdrawals
 */
router.get("/withdrawals", requireAuth, async (req, res, next) => {
  try {
    const withdrawals = await walletService.getWithdrawals(req.user!.id);
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/wallet/admin/withdrawals — Admin list all withdrawals
 */
router.get("/admin/withdrawals", requireAuth, async (req, res, next) => {
  try {
    const list = await walletService.adminListWithdrawals();
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wallet/admin/withdrawals/:id/approve
 */
router.post("/admin/withdrawals/:id/approve", requireAuth, async (req, res, next) => {
  try {
    const result = await walletService.adminApproveWithdrawal(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wallet/admin/withdrawals/:id/reject
 */
router.post("/admin/withdrawals/:id/reject", requireAuth, async (req, res, next) => {
  try {
    const result = await walletService.adminRejectWithdrawal(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Bank Account endpoints
// ============================================================

/**
 * GET /api/wallet/bank-accounts
 */
router.get("/bank-accounts", requireAuth, async (req, res, next) => {
  try {
    const accounts = await bankAccountService.listBankAccounts(req.user!.id);
    res.json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wallet/bank-accounts
 */
const addBankSchema = z.object({
  bankName: z.string().min(1).max(100),
  bankCode: z.string().min(1).max(10),
  accountNumber: z.string().min(5).max(50),
  accountHolder: z.string().min(1).max(255),
  isPrimary: z.boolean().optional(),
});

router.post("/bank-accounts", requireAuth, requireKyc, validate(addBankSchema), async (req, res, next) => {
  try {
    const account = await bankAccountService.addBankAccount(req.user!.id, req.body);
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/wallet/bank-accounts/:id
 */
router.put("/bank-accounts/:id", requireAuth, requireKyc, validate(addBankSchema.partial()), async (req, res, next) => {
  try {
    const account = await bankAccountService.updateBankAccount(getParam(req, "id"), req.user!.id, req.body);
    if (!account) {
      res.status(404).json({ success: false, error: "Bank account not found" });
      return;
    }
    res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/wallet/bank-accounts/:id
 */
router.delete("/bank-accounts/:id", requireAuth, requireKyc, async (req, res, next) => {
  try {
    const deleted = await bankAccountService.deleteBankAccount(getParam(req, "id"), req.user!.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Bank account not found" });
      return;
    }
    res.json({ success: true, message: "Bank account deleted" });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wallet/bank-accounts/:id/set-primary
 */
router.post("/bank-accounts/:id/set-primary", requireAuth, requireKyc, async (req, res, next) => {
  try {
    const account = await bankAccountService.setPrimaryBankAccount(getParam(req, "id"), req.user!.id);
    if (!account) {
      res.status(404).json({ success: false, error: "Bank account not found" });
      return;
    }
    res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
});

export default router;
