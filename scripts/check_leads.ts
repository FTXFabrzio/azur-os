import { db } from "../lib/db";
import { leads } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const allLeads = await db.query.leads.findMany();
  console.log("Total leads:", allLeads.length);
  
  const kanban = allLeads.filter(l => 
    ['POTENTIAL_CLIENT', 'LEAD_ALL', 'REVISION', 'LEAD_LIBRE'].includes(l.category)
  );
  console.log("Kanban categories leads:", kanban.length);
  
  if (kanban.length > 0) {
    console.log("Samples:", kanban.slice(0, 3).map(l => ({
      id: l.id,
      category: l.category,
      kanbanStep: l.kanbanStep,
      period: l.period,
      brand: l.brand
    })));
  }

  const byCat = allLeads.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {} as Record<string,number>);
  console.log("Categories:", byCat);
}

main().catch(console.error);
