
const { createClient } = require("@libsql/client");
require("dotenv").config();

async function checkDatabase() {
  try {
    const client = createClient({
      url: process.env.DATABASE_URL.replace("libsql://", "wss://"),
      authToken: process.env.DATABASE_TOKEN,
    });

    console.log("🔍 Checking Users Table Structure...");
    
    // 1. Check if column exists
    const columns = await client.execute("PRAGMA table_info(users)");
    const hasPushSub = columns.rows.some(r => r.name === 'push_subscription');
    
    console.log("Column 'push_subscription' exists?:", hasPushSub ? "✅ YES" : "❌ NO");
    
    if (!hasPushSub) {
      console.log("⚠️ Column missing! Attempting to add it...");
      await client.execute("ALTER TABLE users ADD COLUMN push_subscription TEXT");
      console.log("✅ Column added successfully.");
    }

    // 2. Check current values for all users
    console.log("\n📊 Current User Subscriptions:");
    const users = await client.execute("SELECT username, push_subscription FROM users");
    
    users.rows.forEach(u => {
      const subStatus = u.push_subscription ? "✅ Has Data (" + u.push_subscription.length + " chars)" : "❌ NULL";
      console.log(`- ${u.username}: ${subStatus}`);
    });

  } catch (error) {
    console.error("❌ Database Error:", error);
  }
}

checkDatabase();
