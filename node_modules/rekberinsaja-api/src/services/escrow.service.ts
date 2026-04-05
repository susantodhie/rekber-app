import { db } from "../db/index.js";
import { escrowTransactions, escrowStatusHistory } from "../db/schema/escrow.js";
import { userProfiles } from "../db/schema/users.js";
import { wallets, walletTransactions } from "../db/schema/wallet.js";
import { conversations, conversationParticipants, messages } from "../db/schema/messages.js";
import { eq, or, desc, and, count, sql } from "drizzle-orm";
import { generateTxCode } from "../lib/id-generator.js";
import { calculateFees } from "../lib/fee-calculator.js";
import type { CreateEscrowInput, EscrowFilterParams } from "../types/index.js";

/**
 * Create a new escrow transaction
 */
export async function createEscrow(userId: string, input: CreateEscrowInput) {
  // 0. Verify the creator has completed KYC
  const [creatorProfile] = await db
    .select({ kycStatus: userProfiles.kycStatus })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!creatorProfile || creatorProfile.kycStatus !== "verified") {
    throw new Error("KYC belum selesai");
  }

  // 1. Find counterparty by username
  const [counterparty] = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.username, input.counterpartyUsername))
    .limit(1);

  if (!counterparty) {
    throw new Error("Counterparty not found");
  }

  if (counterparty.userId === userId) {
    throw new Error("Cannot create escrow with yourself");
  }

  // 2. Determine buyer/seller
  const buyerId = input.role === "buyer" ? userId : counterparty.userId;
  const sellerId = input.role === "seller" ? userId : counterparty.userId;

  // 3. Calculate fees
  const fees = calculateFees(input.amount);
  const txCode = generateTxCode(input.category);
  const paymentMethod = input.paymentMethod || "qris";

  // 4. If wallet payment, validate and deduct balance atomically
  if (paymentMethod === "wallet") {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (!wallet) {
      throw new Error("Wallet tidak ditemukan. Silakan top up terlebih dahulu.");
    }

    const currentBalance = parseFloat(wallet.balance);
    if (currentBalance < fees.totalAmount) {
      throw new Error(`Saldo tidak cukup. Saldo: Rp ${currentBalance.toLocaleString("id-ID")}, Dibutuhkan: Rp ${fees.totalAmount.toLocaleString("id-ID")}`);
    }

    // Deduct balance
    const newBalance = currentBalance - fees.totalAmount;
    await db
      .update(wallets)
      .set({ balance: String(newBalance), updatedAt: new Date() })
      .where(eq(wallets.id, wallet.id));

    // Record wallet transaction
    await db.insert(walletTransactions).values({
      walletId: wallet.id,
      type: "escrow_payment",
      amount: String(fees.totalAmount),
      balanceAfter: String(newBalance),
      description: `Pembayaran escrow ${txCode} — ${input.itemName}`,
      status: "completed",
    });
  }

  // 5. Create escrow transaction
  const [escrow] = await db
    .insert(escrowTransactions)
    .values({
      txCode,
      buyerId,
      sellerId,
      createdBy: userId,
      itemName: input.itemName,
      category: input.category,
      description: input.description,
      amount: String(fees.amount),
      adminFee: String(fees.adminFee),
      insuranceFee: String(fees.insuranceFee),
      totalAmount: String(fees.totalAmount),
      status: "waiting_seller_action",
      paymentMethod,
      ...(paymentMethod === "wallet" ? { paidAt: new Date() } : {}),
    })
    .returning();

  // 6. Create status history entry
  await db.insert(escrowStatusHistory).values({
    escrowId: escrow.id,
    fromStatus: null,
    toStatus: "waiting_seller_action",
    changedBy: userId,
    note: `Escrow created. Payment: ${paymentMethod.toUpperCase()}${paymentMethod === "wallet" ? " (auto-paid)" : ""}`,
  });

  // 7. Create conversation for this escrow
  const [conversation] = await db
    .insert(conversations)
    .values({
      escrowId: escrow.id,
      type: "escrow",
    })
    .returning();

  // Add both participants
  await db.insert(conversationParticipants).values([
    { conversationId: conversation.id, userId: buyerId },
    { conversationId: conversation.id, userId: sellerId },
  ]);

  // System message
  const paymentLabel = paymentMethod === "wallet" ? "💰 Wallet Balance" : paymentMethod === "qris" ? "📱 QRIS" : "💳 DANA";
  await db.insert(messages).values({
    conversationId: conversation.id,
    content: `Escrow ${txCode} dibuat untuk "${input.itemName}" — Total: Rp ${fees.totalAmount.toLocaleString("id-ID")} — Pembayaran: ${paymentLabel}`,
    type: "system",
    isSystem: true,
  });

  return escrow;
}

/**
 * List user's escrow transactions with filters
 */
export async function listEscrows(userId: string, params: EscrowFilterParams) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const [userProfile] = await db.select({ role: userProfiles.role }).from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  const isAdmin = userProfile?.role === "admin";

  let conditions = undefined;

  // Build where conditions
  if (!isAdmin) {
    conditions = or(
      eq(escrowTransactions.buyerId, userId),
      eq(escrowTransactions.sellerId, userId)
    );
  }

  if (params.status) {
    conditions = conditions 
      ? and(conditions, eq(escrowTransactions.status, params.status as any))
      : eq(escrowTransactions.status, params.status as any);
  }

  // Get transactions
  const txs = await db
    .select()
    .from(escrowTransactions)
    .where(conditions)
    .orderBy(desc(escrowTransactions.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(escrowTransactions)
    .where(conditions);

  return {
    transactions: txs,
    total: totalResult?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalResult?.count || 0) / pageSize),
  };
}

/**
 * Get escrow detail by ID
 */
export async function getEscrowDetail(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) return null;

  // Verify user is buyer or seller or admin
  const [userProfile] = await db.select({ role: userProfiles.role }).from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  const isAdmin = userProfile?.role === "admin";

  if (escrow.buyerId !== userId && escrow.sellerId !== userId && !isAdmin) {
    throw new Error("Access denied");
  }

  // Get status history
  const history = await db
    .select()
    .from(escrowStatusHistory)
    .where(eq(escrowStatusHistory.escrowId, escrowId))
    .orderBy(desc(escrowStatusHistory.createdAt));

  // Get buyer and seller profiles
  const [buyerProfile] = await db
    .select({ username: userProfiles.username, avatarUrl: userProfiles.avatarUrl })
    .from(userProfiles)
    .where(eq(userProfiles.userId, escrow.buyerId))
    .limit(1);

  const [sellerProfile] = await db
    .select({ username: userProfiles.username, avatarUrl: userProfiles.avatarUrl })
    .from(userProfiles)
    .where(eq(userProfiles.userId, escrow.sellerId))
    .limit(1);

  return {
    ...escrow,
    buyer: buyerProfile,
    seller: sellerProfile,
    statusHistory: history,
  };
}

/**
 * Buyer pays / locks funds for escrow
 */
export async function payEscrow(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(
      and(
        eq(escrowTransactions.id, escrowId),
        eq(escrowTransactions.buyerId, userId),
        eq(escrowTransactions.status, "pending_payment")
      )
    )
    .limit(1);

  if (!escrow) throw new Error("Escrow not found or not payable");

  // Check buyer wallet balance
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) throw new Error("Wallet not found");

  const balance = parseFloat(wallet.balance);
  const totalAmount = parseFloat(escrow.totalAmount);

  if (balance < totalAmount) {
    throw new Error("Insufficient balance");
  }

  // Deduct and lock funds
  const newBalance = balance - totalAmount;
  const newLocked = parseFloat(wallet.lockedBalance) + totalAmount;

  await db
    .update(wallets)
    .set({
      balance: String(newBalance),
      lockedBalance: String(newLocked),
      updatedAt: new Date(),
    })
    .where(eq(wallets.userId, userId));

  // Create wallet transaction record
  await db.insert(walletTransactions).values({
    walletId: wallet.id,
    escrowId,
    type: "escrow_lock",
    amount: String(totalAmount),
    balanceAfter: String(newBalance),
    description: `Dana dikunci untuk escrow ${escrow.txCode} — ${escrow.itemName}`,
    status: "completed",
  });

  // Update escrow status
  await db
    .update(escrowTransactions)
    .set({
      status: "processing",
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(escrowTransactions.id, escrowId));

  // Log status change
  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: "pending_payment",
    toStatus: "processing",
    changedBy: userId,
    note: "Buyer payment confirmed, funds locked",
  });

  return { success: true };
}

/**
 * Seller ships and provides tracking info
 */
export async function shipEscrow(
  escrowId: string,
  userId: string,
  trackingNumber: string,
  shippingProofUrl?: string
) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(
      and(
        eq(escrowTransactions.id, escrowId),
        eq(escrowTransactions.sellerId, userId),
        eq(escrowTransactions.status, "processing")
      )
    )
    .limit(1);

  if (!escrow) throw new Error("Escrow not found or not shippable");

  await db
    .update(escrowTransactions)
    .set({
      status: "shipped",
      trackingNumber,
      shippingProof: shippingProofUrl || null,
      shippedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(escrowTransactions.id, escrowId));

  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: "processing",
    toStatus: "shipped",
    changedBy: userId,
    note: `Tracking number: ${trackingNumber}`,
  });

  return { success: true };
}

/**
 * Buyer confirms receipt → releases funds to seller
 */
export async function confirmEscrow(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(
      and(
        eq(escrowTransactions.id, escrowId),
        eq(escrowTransactions.buyerId, userId),
        eq(escrowTransactions.status, "shipped")
      )
    )
    .limit(1);

  if (!escrow) throw new Error("Escrow not found or not confirmable");

  // Release locked funds to seller
  const amount = parseFloat(escrow.amount); // Seller receives base amount (minus fees)

  // Reduce buyer's locked balance
  const [buyerWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, escrow.buyerId))
    .limit(1);

  if (buyerWallet) {
    const totalAmount = parseFloat(escrow.totalAmount);
    await db
      .update(wallets)
      .set({
        lockedBalance: String(parseFloat(buyerWallet.lockedBalance) - totalAmount),
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, escrow.buyerId));
  }

  // Add funds to seller wallet
  const [sellerWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, escrow.sellerId))
    .limit(1);

  if (sellerWallet) {
    const newBalance = parseFloat(sellerWallet.balance) + amount;
    await db
      .update(wallets)
      .set({
        balance: String(newBalance),
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, escrow.sellerId));

    // Create wallet transaction for seller
    await db.insert(walletTransactions).values({
      walletId: sellerWallet.id,
      escrowId,
      type: "escrow_release",
      amount: String(amount),
      balanceAfter: String(newBalance),
      description: `Dana diterima dari escrow ${escrow.txCode} — ${escrow.itemName}`,
      status: "completed",
    });
  }

  // Update escrow status to completed
  await db
    .update(escrowTransactions)
    .set({
      status: "completed",
      confirmedAt: new Date(),
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(escrowTransactions.id, escrowId));

  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: "shipped",
    toStatus: "completed",
    changedBy: userId,
    note: "Buyer confirmed receipt, funds released to seller",
  });

  return { success: true };
}

/**
 * Cancel escrow (only before payment)
 */
export async function cancelEscrow(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(
      and(
        eq(escrowTransactions.id, escrowId),
        eq(escrowTransactions.status, "pending_payment")
      )
    )
    .limit(1);

  if (!escrow) throw new Error("Escrow not found or cannot be cancelled");

  // Verify user is buyer or seller
  if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
    throw new Error("Access denied");
  }

  await db
    .update(escrowTransactions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(escrowTransactions.id, escrowId));

  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: "pending_payment",
    toStatus: "cancelled",
    changedBy: userId,
    note: "Transaction cancelled",
  });

  return { success: true };
}

/**
 * Get status change history for an escrow
 */
export async function getEscrowHistory(escrowId: string) {
  return db
    .select()
    .from(escrowStatusHistory)
    .where(eq(escrowStatusHistory.escrowId, escrowId))
    .orderBy(desc(escrowStatusHistory.createdAt));
}

/**
 * Start Transaction Chat (by both buyer and seller)
 */
export async function startTransactionChat(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
    throw new Error("Access denied");
  }

  // Update status to transaction_started
  await db
    .update(escrowTransactions)
    .set({ status: "transaction_started", chatStatus: "in_progress", updatedAt: new Date() })
    .where(eq(escrowTransactions.id, escrowId));

  // Find conversation
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.escrowId, escrowId))
    .limit(1);

  if (conversation) {
    await db.insert(messages).values({
      conversationId: conversation.id,
      content: "Transaction has been officially started.",
      type: "system",
      isSystem: true,
    });
    
    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id));
  }

  return { success: true };
}

/**
 * Join Escrow Transaction
 */
export async function joinTransaction(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  let updateData: any = { updatedAt: new Date() };

  if (escrow.buyerId === userId) {
    updateData.isBuyerJoined = true;
  } else if (escrow.sellerId === userId) {
    updateData.isSellerJoined = true;
  } else {
    throw new Error("Access denied");
  }

  const isBuyerJoined = escrow.buyerId === userId ? true : escrow.isBuyerJoined;
  const isSellerJoined = escrow.sellerId === userId ? true : escrow.isSellerJoined;

  let newStatus = escrow.status;
  if (isBuyerJoined && isSellerJoined) {
    newStatus = "chat_active"; // Default to chat_active when both join
  } else if (isSellerJoined && !isBuyerJoined) {
    newStatus = "waiting_both_parties";
  } else if (isBuyerJoined && !isSellerJoined) {
    newStatus = "waiting_seller_action";
  }
  
  if (newStatus !== escrow.status) {
    updateData.status = newStatus;
  }

  await db
    .update(escrowTransactions)
    .set(updateData)
    .where(eq(escrowTransactions.id, escrowId));

  if (newStatus !== escrow.status) {
    await db.insert(escrowStatusHistory).values({
      escrowId,
      fromStatus: escrow.status,
      toStatus: newStatus,
      changedBy: userId,
      note: `Participant joined the transaction.`,
    });
  }

  return { success: true, status: newStatus };
}

/**
 * Upload Escrow Proof (replaces shipEscrow logic)
 */
export async function uploadEscrowProof(
  escrowId: string,
  userId: string,
  proofUrl: string
) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  // Allow upload during transaction_started OR after payment_rejected (re-upload)
  if (escrow.status !== "transaction_started" && escrow.status !== "payment_rejected") {
    throw new Error("Proof upload is not allowed in the current status");
  }

  let updateData: any = { updatedAt: new Date() };
  let role = "";

  if (escrow.buyerId === userId) {
    updateData.paymentProof = proofUrl;
    role = "Buyer";
  } else if (escrow.sellerId === userId) {
    updateData.shippingProof = proofUrl; // reusing shippingProof for seller's proof
    role = "Seller";
  } else {
    throw new Error("Access denied");
  }

  const hasBuyerProof = escrow.buyerId === userId ? true : !!escrow.paymentProof;
  const hasSellerProof = escrow.sellerId === userId ? true : !!escrow.shippingProof;

  let newStatus: string = escrow.status;
  if (hasBuyerProof && hasSellerProof) {
    newStatus = "waiting_verification";
  }

  if (newStatus !== escrow.status) {
    updateData.status = newStatus;
    // Clear rejection reason when transitioning to waiting_verification again
    updateData.rejectionReason = null;
  }

  await db
    .update(escrowTransactions)
    .set(updateData)
    .where(eq(escrowTransactions.id, escrowId));

  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: escrow.status,
    toStatus: newStatus !== escrow.status ? newStatus : escrow.status,
    changedBy: userId,
    note: `${role} uploaded proof.`,
  });

  return { success: true, status: newStatus !== escrow.status ? newStatus : escrow.status };
}

/**
 * Complete Transaction Chat (by buyer)
 */
export async function completeTransactionChat(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  if (escrow.buyerId !== userId) {
    throw new Error("Only buyer can complete the transaction");
  }

  // Update chatStatus to completed (and status to success if verified)
  // Wait, if it requires admin verification, the buyer shouldn't be able to bypass it.
  if (escrow.status !== "verified" && escrow.status !== "success") {
    throw new Error("Transaction must be verified by admin before completion");
  }

  await db
    .update(escrowTransactions)
    .set({ status: "success", chatStatus: "completed", completedAt: new Date(), updatedAt: new Date() })
    .where(eq(escrowTransactions.id, escrowId));

  // Find conversation
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.escrowId, escrowId))
    .limit(1);

  if (conversation) {
    await db.insert(messages).values({
      conversationId: conversation.id,
      content: "Transaction has been successfully completed by buyer.",
      type: "system",
      isSystem: true,
    });

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id));
  }

  // Release funds to seller
  const amount = parseFloat(escrow.amount);
  const [sellerWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, escrow.sellerId))
    .limit(1);

  if (sellerWallet) {
    const newBalance = parseFloat(sellerWallet.balance) + amount;
    await db
      .update(wallets)
      .set({ balance: String(newBalance), updatedAt: new Date() })
      .where(eq(wallets.userId, escrow.sellerId));

    await db.insert(walletTransactions).values({
      walletId: sellerWallet.id,
      escrowId,
      type: "escrow_release",
      amount: String(amount),
      balanceAfter: String(newBalance),
      description: `Dana diterima dari escrow ${escrow.txCode} — ${escrow.itemName}`,
      status: "completed",
    });
  }

  return { success: true };
}

/**
 * Admin Approves Payment — verifies proofs and advances transaction
 */
export async function adminApprovePayment(escrowId: string, adminId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  if (escrow.status !== "waiting_verification") {
    throw new Error(`Cannot approve payment in status: ${escrow.status}`);
  }

  await db
    .update(escrowTransactions)
    .set({ status: "verified", rejectionReason: null, updatedAt: new Date() })
    .where(eq(escrowTransactions.id, escrowId));

  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: escrow.status,
    toStatus: "verified",
    changedBy: adminId,
    note: "Admin approved the payment proofs.",
  });

  // Send system message
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.escrowId, escrowId))
    .limit(1);

  if (conversation) {
    await db.insert(messages).values({
      conversationId: conversation.id,
      content: "Pembayaran disetujui oleh Admin. Transaksi dapat dilanjutkan.",
      type: "system",
      isSystem: true,
    });
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversation.id));
  }

  return { success: true, status: "verified" };
}

/**
 * Admin Rejects Payment — sends back for re-upload
 */
export async function adminRejectPayment(escrowId: string, adminId: string, reason: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  if (escrow.status !== "waiting_verification") {
    throw new Error(`Cannot reject payment in status: ${escrow.status}`);
  }

  await db
    .update(escrowTransactions)
    .set({
      status: "payment_rejected",
      rejectionReason: reason,
      paymentProof: null,
      shippingProof: null,
      updatedAt: new Date(),
    })
    .where(eq(escrowTransactions.id, escrowId));

  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: escrow.status,
    toStatus: "payment_rejected",
    changedBy: adminId,
    note: `Admin rejected payment. Reason: ${reason}`,
  });

  // Send system message
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.escrowId, escrowId))
    .limit(1);

  if (conversation) {
    await db.insert(messages).values({
      conversationId: conversation.id,
      content: `Pembayaran ditolak oleh Admin. Alasan: ${reason}`,
      type: "system",
      isSystem: true,
    });
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversation.id));
  }

  return { success: true, status: "payment_rejected" };
}

/**
 * Admin Joins Chat — adds admin as conversation participant
 */
export async function adminJoinChat(escrowId: string, adminId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.escrowId, escrowId))
    .limit(1);

  if (!conversation) throw new Error("Conversation not found");

  // Check if admin is already a participant
  const [existing] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversation.id),
        eq(conversationParticipants.userId, adminId)
      )
    )
    .limit(1);

  if (!existing) {
    await db.insert(conversationParticipants).values({
      conversationId: conversation.id,
      userId: adminId,
    });

    await db.insert(messages).values({
      conversationId: conversation.id,
      content: "Admin bergabung ke chat transaksi.",
      type: "system",
      isSystem: true,
    });

    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversation.id));
  }

  return { success: true };
}

