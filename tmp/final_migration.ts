import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN,
    });

    console.log("Checking columns for leads...");
    const tableInfo = await client.execute("PRAGMA table_info(leads)");
    const hasPeriod = tableInfo.rows.some(row => row.name === 'period');

    if (!hasPeriod) {
        console.log("Adding column 'period' to leads...");
        await client.execute("ALTER TABLE leads ADD COLUMN period TEXT DEFAULT 'MARZO'");
        console.log("Column added.");
    } else {
        console.log("Column 'period' already exists in leads.");
    }

    console.log("Updating all records to FEBRERO...");
    await client.execute("UPDATE leads SET period = 'FEBRERO'");
    await client.execute("UPDATE discarded_leads_stats SET period = 'FEBRERO'");
    
    console.log("Success!");
}

main().catch(e => {
    console.error("CRITICAL ERROR:", e);
    process.exit(1);
});
