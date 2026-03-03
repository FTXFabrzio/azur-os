import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN || "",
    });

    console.log("Updating leads with quotes...");
    try {
        await client.execute('UPDATE leads SET "period" = \'FEBRERO\'');
        console.log("Leads success!");
    } catch (e) {
        console.log("Leads error:", e.message);
    }
}

main();
