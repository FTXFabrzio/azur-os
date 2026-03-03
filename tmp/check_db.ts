import "dotenv/config";
import { db } from "../lib/db";
import { leads, discardedLeadsStats } from "../lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
    const lCount = await db.select({ count: sql`count(*)` }).from(leads);
    const dCount = await db.select({ count: sql`count(*)` }).from(discardedLeadsStats);
    
    console.log("ALeads:", lCount[0].count);
    console.log("DStats:", dCount[0].count);
    
    const dStats = await db.select().from(discardedLeadsStats);
    console.log("DRecords:", dStats.map(d => ({ p: d.period, b: d.brand })));
}

main().catch(console.error);
