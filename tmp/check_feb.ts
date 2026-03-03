import "dotenv/config";
import { db } from "../lib/db";
import { leads, discardedLeadsStats } from "../lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
    const lCount = await db.select({ count: sql`count(*)` }).from(leads);
    const dCount = await db.select({ count: sql`count(*)` }).from(discardedLeadsStats);
    
    console.log("ALeads:", lCount[0].count);
    console.log("DStats:", dCount[0].count);
    
    const febA = await db.select({ count: sql`count(*)` }).from(leads).where(sql`period = 'FEBRERO'`);
    console.log("ALeads February:", febA[0].count);
}

main().catch(console.error);
