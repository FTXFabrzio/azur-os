import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN || "",
    });

    console.log("Updating stats to FEBRERO...");
    // Try both quoted and unquoted for period
    await client.execute('UPDATE "discarded_leads_stats" SET "period" = \'FEBRERO\'');
    console.log("Stats success!");
}

main();
