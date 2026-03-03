import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN || "",
    });

    const info = await client.execute("PRAGMA table_info(discarded_leads_stats)");
    console.log("COLUMNS STATS:", JSON.stringify(info.rows, null, 2));
}

main();
