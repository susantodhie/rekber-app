import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;

// For queries
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// For migrations (separate connection)
export const migrationClient = postgres(connectionString, { max: 1 });
