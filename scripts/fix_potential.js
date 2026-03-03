import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_TOKEN,
});

async function main() {
  const result = await client.execute('SELECT id, contact_name, status, category FROM leads WHERE category = "POTENTIAL_CLIENT"');
  console.log("ALL POTENTIAL CLIENTS:");
  console.log(JSON.stringify(result.rows, null, 2));

  console.log("UPDATE STATUS TO WAITING_FOR_DATE FOR ON_HOLD ONES");
  const updateResult = await client.execute('UPDATE leads SET status = "WAITING_FOR_DATE" WHERE category = "POTENTIAL_CLIENT" AND status = "ON_HOLD"');
  
  console.log(`Updated ${updateResult.rowsAffected} leads.`);

  const afterResult = await client.execute('SELECT id, contact_name, status, category FROM leads WHERE category = "POTENTIAL_CLIENT"');
  console.log("AFTER UPDATE:");
  console.log(JSON.stringify(afterResult.rows, null, 2));
}
main();
