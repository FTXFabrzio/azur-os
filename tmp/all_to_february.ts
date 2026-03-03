import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN || "",
    });

    console.log("Updating leads...");
    await client.execute('UPDATE leads SET "period" = \'FEBRERO\'');
    console.log("Updating stats...");
    await client.execute('UPDATE "discarded_leads_stats" SET "period" = \'FEBRERO\'');
    console.log("ALL MOVING TO FEBRERO DONE!");
}

main();
