
const { createClient } = require("@libsql/client");
require("dotenv").config();

async function debug() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_TOKEN,
  });

  try {
    console.log("Checking leads table structure...");
    const tableInfo = await client.execute("PRAGMA table_info(leads)");
    console.log("Columns:", tableInfo.rows.map(r => r.name).join(", "));

    console.log("\nChecking sample leads (first 5)...");
    const sampleLeads = await client.execute("SELECT id, contact_name, category, brand, period, kanban_step FROM leads LIMIT 5");
    console.table(sampleLeads.rows);

    console.log("\nCounting by category...");
    const counts = await client.execute("SELECT category, count(*) as count FROM leads GROUP BY category");
    console.table(counts.rows);

    console.log("\nCounting by period...");
    const periods = await client.execute("SELECT period, count(*) as count FROM leads GROUP BY period");
    console.table(periods.rows);

  } catch (err) {
    console.error("DEBUG ERROR:", err);
  } finally {
    process.exit(0);
  }
}

debug();
