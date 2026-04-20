import express from "express";
import {
  getAdminStats,
  openDispute,
  resolveDispute,
  processWithdrawal,
  getActivityLog,
  getPendingKyc,
  getAllTransactions,
  getWithdrawals,
  listDisputes
} from "../services/admin.service.js";

const router = express.Router();

// GET /api/admin/dashboard (Dipanggil oleh useAdminDashboard)
router.get("/dashboard", async (req, res) => {
  const data = await getAdminStats();
  res.json({ data });
});

// GET /api/admin/transactions
router.get("/transactions", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const result = await getAllTransactions(page, pageSize);
  res.json(result);
});

// GET /api/admin/disputes
router.get("/disputes", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const result = await listDisputes(page, pageSize);
  res.json(result);
});

router.post("/dispute/open", async (req, res) => {
  const { escrowId, userId, reason, evidenceUrls } = req.body;
  const result = await openDispute(escrowId, userId, reason, evidenceUrls);
  res.json(result);
});

// POST /api/admin/disputes/:id/resolve
router.post("/disputes/:id/resolve", async (req, res) => {
  const disputeId = req.params.id;
  const { adminUserId, ...input } = req.body; // Frontend sends data in body
  // Get admin user from auth middleware
  const adminId = req.user!.id;
  const result = await resolveDispute(disputeId, adminId, input);
  res.json(result);
});

// GET /api/admin/withdrawals
router.get("/withdrawals", async (req, res) => {
  const data = await getWithdrawals();
  res.json({ data });
});

// POST /api/admin/withdrawals/:id/process
router.post("/withdrawals/:id/process", async (req, res) => {
  const withdrawalId = req.params.id;
  const { approve } = req.body;
  const adminId = req.user!.id; // Ensure req.user exists from auth
  const result = await processWithdrawal(withdrawalId, adminId, approve);
  res.json(result);
});

router.get("/activity-log", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const data = await getActivityLog(page, pageSize);
  res.json({ data });
});

router.get("/kyc/pending", async (req, res) => {
  const data = await getPendingKyc();
  res.json(data);
});

export const adminRoutes = router;