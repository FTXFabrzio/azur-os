import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding column...");
    await db.run(sql`ALTER TABLE leads ADD COLUMN "period" TEXT DEFAULT 'MARZO'`);
    console.log("Success!");
}

main().catch(console.error);
