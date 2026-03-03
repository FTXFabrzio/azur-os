import { createClient } from "@libsql/client";
import "dotenv/config";

async function run() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_TOKEN!,
  });

  console.log("Checking structure for discarded_leads_stats...");
  const res = await client.execute("PRAGMA table_info(discarded_leads_stats)");
  console.log(JSON.stringify(res.rows, null, 2));
}
run();
