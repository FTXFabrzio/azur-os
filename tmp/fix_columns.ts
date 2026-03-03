import { createClient } from "@libsql/client";
import "dotenv/config";

async function run() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_TOKEN!,
  });

  console.log("Fixing missing columns in discarded_leads_stats...");
  const columns = [
    { name: "kommo_id", type: "TEXT" },
    { name: "contact_name", type: "TEXT" },
    { name: "phone", type: "TEXT" },
    { name: "discarded_at", type: "TEXT" }
  ];

  for (const col of columns) {
    try {
      await client.execute(`ALTER TABLE discarded_leads_stats ADD COLUMN ${col.name} ${col.type}`);
      console.log(`Column ${col.name} added.`);
    } catch (e: any) {
      console.log(`Column ${col.name} - ${e.message}`);
    }
  }
}
run();
