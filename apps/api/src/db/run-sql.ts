import { migrationClient } from "./index.js";

async function main() {
  console.log("Running SQL directly...");
  
  await migrationClient`
    CREATE TABLE IF NOT EXISTS "reviews" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "escrow_id" uuid NOT NULL,
      "reviewer_id" uuid NOT NULL,
      "target_user_id" uuid NOT NULL,
      "role" text NOT NULL,
      "rating" integer NOT NULL,
      "comment" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "reviews_escrow_id_reviewer_id_unique" UNIQUE("escrow_id","reviewer_id")
    );
  `;

  try {
    await migrationClient`ALTER TABLE "reviews" ADD CONSTRAINT "reviews_escrow_id_escrow_transactions_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrow_transactions"("id") ON DELETE cascade ON UPDATE no action;`;
    await migrationClient`ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`;
    await migrationClient`ALTER TABLE "reviews" ADD CONSTRAINT "reviews_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`;
  } catch (error: any) {
    if (!error.message.includes("already exists")) {
       throw error;
    }
  }

  console.log("SQL execution complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
