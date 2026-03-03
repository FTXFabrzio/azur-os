import "dotenv/config";
import { db } from "../lib/db";
import { leads, discardedLeadsStats } from "../lib/db/schema";

async function main() {
    console.log("Using Drizzle Update...");
    await db.update(leads).set({ period: "FEBRERO" });
    await db.update(discardedLeadsStats).set({ period: "FEBRERO" });
    console.log("DONE DRIZZLE!");
}

main().catch(console.error);
