import { createClient } from "@libsql/client";
import "dotenv/config";

async function run() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_TOKEN!,
  });

  console.log("Adding columns to discarded_leads_stats...");
  const queries = [
    "ALTER TABLE discarded_leads_stats ADD COLUMN kommo_id TEXT",
    "ALTER TABLE discarded_leads_stats ADD COLUMN contact_name TEXT",
    "ALTER TABLE discarded_leads_stats ADD COLUMN phone TEXT",
    "ALTER TABLE discarded_leads_stats ADD COLUMN discarded_at TEXT DEFAULT CURRENT_TIMESTAMP"
  ];

  for (const q of queries) {
    try {
      await client.execute(q);
      console.log(`Executed: ${q}`);
    } catch (e) {
      console.log(`Skipped (likely exists): ${q}`);
    }
  }
}
run();
