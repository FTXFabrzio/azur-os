import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_TOKEN,
});

async function main() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS \`discarded_leads_stats\` (
        \`id\` text PRIMARY KEY NOT NULL,
        \`brand\` text NOT NULL,
        \`category\` text NOT NULL,
        \`reason\` text NOT NULL,
        \`period\` text NOT NULL,
        \`kommo_id\` text,
        \`contact_name\` text,
        \`phone\` text,
        \`discarded_at\` text DEFAULT CURRENT_TIMESTAMP,
        \`created_at\` text DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Attempt to add column just in case table existed but column was missing
    try {
        await client.execute(`ALTER TABLE \`discarded_leads_stats\` ADD COLUMN \`category\` text NOT NULL DEFAULT 'NO_RESPONSE';`);
        console.log("Added column category");
    } catch (e) {
        console.log("Column category might already exist or table exists.");
    }
    
    console.log("Table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

main();
