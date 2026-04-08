ALTER TABLE "wallets" DROP CONSTRAINT "wallets_user_id_unique";--> statement-breakpoint
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk";
--> statement-breakpoint
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_escrow_id_escrow_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "withdrawals" DROP CONSTRAINT "withdrawals_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "withdrawals" DROP CONSTRAINT "withdrawals_bank_account_id_bank_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "withdrawals" DROP CONSTRAINT "withdrawals_processed_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "wallet_transactions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "locked_balance" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "withdrawals" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "withdrawals" ALTER COLUMN "amount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "withdrawals" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "withdrawals" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "withdrawals" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "withdrawals" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kyc_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "transaction_pin" text NOT NULL;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "wallet_transactions" DROP COLUMN "wallet_id";--> statement-breakpoint
ALTER TABLE "wallet_transactions" DROP COLUMN "balance_after";--> statement-breakpoint
ALTER TABLE "wallet_transactions" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "wallet_transactions" DROP COLUMN "reference_id";--> statement-breakpoint
ALTER TABLE "wallet_transactions" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "withdrawals" DROP COLUMN "processed_by";--> statement-breakpoint
DROP TYPE "public"."wallet_transaction_status";--> statement-breakpoint
DROP TYPE "public"."wallet_transaction_type";--> statement-breakpoint
DROP TYPE "public"."withdrawal_status";