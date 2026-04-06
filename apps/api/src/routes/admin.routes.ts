import express from "express";
import {
  getAdminStats,
  openDispute,
  resolveDispute,
  processWithdrawal,
  getActivityLog,
  getPendingKyc
} from "../services/admin.service.js";

const router = express.Router();

// contoh route
router.get("/stats", async (req, res) => {
  const data = await getAdminStats();
  res.json(data);
});

router.post("/dispute/open", async (req, res) => {
  const { escrowId, userId, reason, evidenceUrls } = req.body;
  const result = await openDispute(escrowId, userId, reason, evidenceUrls);
  res.json(result);
});

router.post("/dispute/resolve", async (req, res) => {
  const { disputeId, adminUserId, input } = req.body;
  const result = await resolveDispute(disputeId, adminUserId, input);
  res.json(result);
});

router.post("/withdrawal/process", async (req, res) => {
  const { withdrawalId, adminUserId, approve } = req.body;
  const result = await processWithdrawal(withdrawalId, adminUserId, approve);
  res.json(result);
});

router.get("/activity", async (req, res) => {
  const data = await getActivityLog();
  res.json(data);
});

router.get("/kyc/pending", async (req, res) => {
  const data = await getPendingKyc();
  res.json(data);
});

// 🔥 INI YANG WAJIB BANGET
export const adminRoutes = router;