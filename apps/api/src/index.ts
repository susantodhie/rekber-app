import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { db } from "./db/index.js";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import escrowRoutes from "./routes/escrow.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

// Middleware imports
import { errorHandler } from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000");

// ============================================================
// Global Middleware
// ============================================================

app.use(
  cors({
    origin: true, // Allow all origins during development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow serving uploaded files
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.get("/api/db-check", async (req, res) => {
  try {
    const result = await db.execute("SELECT 1");
    res.json({ success: true, result });
  } catch (err) {
    res.json({ success: false, error: err });
  }
});

// Serve uploaded files statically
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
app.use("/uploads", express.static(path.resolve(uploadDir)));

// ============================================================
// Health check
// ============================================================

app.get("/", (req, res) => {
  res.json({ success: true, message: "API REKBER JALAN 🚀" });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API READY 🚀"
  });
});

// ============================================================
// API Routes
// ============================================================

// Auth routes (Better Auth + custom extensions)
// Note: auth routes handle /api/auth/* internally
app.use(authRoutes);

// Resource routes
app.use("/api/users", userRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/conversations", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

// ============================================================
// 404 handler
// ============================================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ============================================================
// Error handler (must be last)
// ============================================================

app.use(errorHandler);

// ============================================================
// Start server
// ============================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🔐  Rekberinsaja API Server                ║
  ║                                              ║
  ║   → Local:   http://localhost:${PORT}           ║
  ║   → Health:  http://localhost:${PORT}/api/health ║
  ║   → Env:     ${process.env.NODE_ENV || "development"}                    ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
  `);
});

export default app;
