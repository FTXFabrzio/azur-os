
const { createClient } = require("@libsql/client");
require("dotenv").config();

async function migrate() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_TOKEN,
  });

  try {
    console.log("Adding kanban_step column to leads table...");
    await client.execute("ALTER TABLE leads ADD COLUMN kanban_step INTEGER DEFAULT 0");
    console.log("Column added successfully.");
  } catch (err) {
    if (err.message.includes("duplicate column name")) {
        console.log("Column already exists.");
    } else {
        console.error("MIGRATION ERROR:", err);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
