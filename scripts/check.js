import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_TOKEN,
});

async function main() {
  const result = await client.execute('SELECT * FROM discarded_leads_stats');
  console.log(JSON.stringify(result.rows, null, 2));
}
main();
