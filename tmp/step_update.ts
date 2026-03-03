import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN || "",
    });

    console.log("Updating leads...");
    try {
        await client.execute("UPDATE leads SET period = 'FEBRERO'");
        console.log("Leads success!");
    } catch (e) {
        console.log("Leads error:", e instanceof Error ? e.message : String(e));
    }

    console.log("Updating stats...");
    try {
        // Use double quotes just in case
        await client.execute("UPDATE \"discarded_leads_stats\" SET \"period\" = 'FEBRERO'");
        console.log("Stats success!");
    } catch (e) {
        console.log("Stats error:", e instanceof Error ? e.message : String(e));
    }
}

main();
