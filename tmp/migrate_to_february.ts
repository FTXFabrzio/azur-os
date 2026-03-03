import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding column and setting data to FEBRERO...");
    
    try {
        // Try adding the column if it doesn't exist
        await db.run(sql`ALTER TABLE leads ADD COLUMN period TEXT DEFAULT 'MARZO'`);
        console.log("Column added to leads table.");
    } catch (e: any) {
        if (e.message.includes("duplicate column name") || e.message.includes("already exists")) {
            console.log("Column already exists in leads table.");
        } else {
            console.error("Error adding column:", e);
        }
    }

    // Now set everyone to FEBRERO
    await db.run(sql`UPDATE leads SET period = 'FEBRERO'`);
    await db.run(sql`UPDATE discarded_leads_stats SET period = 'FEBRERO'`);
    
    console.log("Migration complete!");
}

main().catch(console.error);
