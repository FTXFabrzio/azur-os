import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN || "",
    });

    const tables = ["leads", "discarded_leads_stats"];
    
    for (const t of tables) {
        console.log(`Checking table ${t}...`);
        const info = await client.execute(`PRAGMA table_info(${t})`);
        const columns = info.rows.map(r => r.name);
        console.log(`Columns for ${t}:`, columns.join(", "));
        
        if (!columns.includes("period")) {
            console.log(`Adding period to ${t}...`);
            await client.execute(`ALTER TABLE "${t}" ADD COLUMN period TEXT DEFAULT 'MARZO'`);
            console.log("Added.");
        }
        
        console.log(`Updating ${t} to FEBRERO...`);
        await client.execute(`UPDATE "${t}" SET period = 'FEBRERO'`);
        console.log("Updated.");
    }
    
    console.log("COMPLETE GLOBAL MIGRATION TO FEBRERO.");
}

main().catch(console.error);
