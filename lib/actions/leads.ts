"use server" 

import { db } from "@/lib/db";
import { leads, clientProspects, businessResources, leadDiscardReasons, discardedLeadsStats } from "@/lib/db/schema";
import { eq, sql, desc, and, like, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getLeads() {
  try {
    const data = await db.query.leads.findMany({
      with: {
        prospect: true,
        businessResource: true,
        discardReason: true,
      },
      orderBy: [desc(leads.createdAt)],
    });
    return data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

export async function getLeadsStats(period?: string) {
  try {
    const activePeriod = period || "MARZO"; // Default to current busy month

    const periodFilter = eq(leads.period, activePeriod);

    const totalLeads = await db.select({ count: sql<number>`count(*)` }).from(leads).where(periodFilter);
    const toSchedule = await db.select({ count: sql<number>`count(*)` }).from(leads).where(and(eq(leads.status, 'PENDING'), periodFilter));
    const waiting = await db.select({ count: sql<number>`count(*)` }).from(leads).where(and(eq(leads.status, 'WAITING_FOR_DATE'), periodFilter));
    const inExecution = await db.select({ count: sql<number>`count(*)` }).from(leads).where(and(eq(leads.status, 'IN_EXECUTION'), periodFilter));
    const onHold = await db.select({ count: sql<number>`count(*)` }).from(leads).where(and(eq(leads.status, 'ON_HOLD'), periodFilter));
    
    // Noise in active leads: CONFUSED + NOT_INTERESTED
    const noiseLeadsActive = await db.select({ count: sql<number>`count(*)` }).from(leads).where(
      and(sql`${leads.category} IN ('CONFUSED', 'NOT_INTERESTED')`, periodFilter)
    );

    const brandsActive = await db.select({ 
      brand: leads.brand, 
      count: sql<number>`count(*)` 
    }).from(leads).where(periodFilter).groupBy(leads.brand);

    const categoriesActive = await db.select({
      category: leads.category,
      count: sql<number>`count(*)`
    }).from(leads).where(periodFilter).groupBy(leads.category);

    // Get Historical Discarded Stats for the same period
    const discardedAggregated = await db.select({
      brand: discardedLeadsStats.brand,
      category: discardedLeadsStats.category,
      reason: discardedLeadsStats.reason,
      count: sql<number>`count(*)`
    })
    .from(discardedLeadsStats)
    .where(eq(discardedLeadsStats.period, activePeriod))
    .groupBy(discardedLeadsStats.brand, discardedLeadsStats.category, discardedLeadsStats.reason);

    // Calculation logic
    let totalDiscarded = 0;
    let azurDiscarded = 0;
    let cocinaDiscarded = 0;
    const combinedCategories: Record<string, number> = {};
    const combinedDiscardReasons: Record<string, number> = {};
    
    // Add active leads to categories
    categoriesActive.forEach(c => {
        combinedCategories[c.category] = (combinedCategories[c.category] || 0) + c.count;
    });

    // Add discarded to totals, brands, categories and reasons
    discardedAggregated.forEach(curr => {
        const count = curr.count;
        totalDiscarded += count;
        if (curr.brand === 'AZUR') azurDiscarded += count;
        if (curr.brand === 'COCINAPRO') cocinaDiscarded += count;
        
        combinedCategories[curr.category] = (combinedCategories[curr.category] || 0) + count;
        if (curr.reason) combinedDiscardReasons[curr.reason] = (combinedDiscardReasons[curr.reason] || 0) + count;
    });

    const finalTotal = totalLeads[0].count + totalDiscarded;
    const azurTotal = (brandsActive.find(b => b.brand === 'AZUR')?.count || 0) + azurDiscarded;
    const cocinaTotal = (brandsActive.find(b => b.brand === 'COCINAPRO')?.count || 0) + cocinaDiscarded;

    // Noise calculation including discarded ones (CONFUSED or NOT_INTERESTED or explicitly discarded categories that mapping here)
    const noiseLeadsDiscarded = discardedAggregated
        .filter(d => d.category === 'CONFUSED' || d.category === 'NOT_INTERESTED')
        .reduce((sum, d) => sum + d.count, 0);

    return {
      total: finalTotal,
      toSchedule: toSchedule[0].count,
      waiting: waiting[0].count,
      inExecution: inExecution[0].count,
      onHold: onHold[0].count,
      totalDiscarded: totalDiscarded,
      noiseRate: finalTotal > 0 ? ((noiseLeadsActive[0].count + noiseLeadsDiscarded) / finalTotal) * 100 : 0,
      azurCount: azurTotal,
      cocinaCount: cocinaTotal,
      categories: combinedCategories,
      discardReasons: combinedDiscardReasons,
    };
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    return { 
      total: 0, 
      toSchedule: 0, 
      waiting: 0, 
      inExecution: 0, 
      onHold: 0, 
      totalDiscarded: 0,
      noiseRate: 0, 
      azurCount: 0, 
      cocinaCount: 0, 
      categories: {}, 
      discardReasons: {} 
    };
  }
}

export async function createLead(data: any) {
    try {
        const id = crypto.randomUUID();
        
        await db.transaction(async (tx) => {
            // 1. Insert Main Lead
            await tx.insert(leads).values({
                id,
                kommoId: data.kommoId,
                brand: data.brand,
                category: data.category,
                contactName: data.contactName,
                phone: data.phone,
                leadEntryDate: data.leadEntryDate,
                period: data.period || "FEBRERO",
                status: 'PENDING',
            });

            // 2. Insert Extension based on Category
            if (data.category === 'POTENTIAL_CLIENT') {
                await tx.insert(clientProspects).values({
                    leadId: id,
                    address: data.address,
                    squareMeters: data.squareMeters,
                    materials: data.materials,
                    hasBlueprints: data.hasBlueprints,
                    requirementsDetail: data.requirementsDetail,
                });
            } else if (data.category === 'JOB_CANDIDATE' || data.category === 'SERVICE_OFFER') {
                await tx.insert(businessResources).values({
                    leadId: id,
                    companyName: data.companyName,
                    offerDetails: data.offerDetails,
                    cvAnalysisSummary: data.cvAnalysisSummary,
                    fileUrl: data.fileUrl,
                });
            } else if (data.category === 'CONFUSED' || data.category === 'NO_RESPONSE' || data.category === 'NOT_INTERESTED') {
                await tx.insert(leadDiscardReasons).values({
                    leadId: id,
                    reasonDetail: data.reasonDetail,
                });
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error creating lead:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateLead(id: string, data: any) {
    try {
        await db.transaction(async (tx) => {
            // 1. Update Main Lead
            await tx.update(leads)
                .set({
                    kommoId: data.kommoId,
                    brand: data.brand,
                    category: data.category,
                    contactName: data.contactName,
                    phone: data.phone,
                    leadEntryDate: data.leadEntryDate,
                    status: data.status,
                    subStatus: data.subStatus,
                })
                .where(eq(leads.id, id));

            // 2. Clear old extensions (cleaner than partial updates when category changes)
            await tx.delete(clientProspects).where(eq(clientProspects.leadId, id));
            await tx.delete(businessResources).where(eq(businessResources.leadId, id));
            await tx.delete(leadDiscardReasons).where(eq(leadDiscardReasons.leadId, id));

            // 3. Insert New Extension based on Category
            if (data.category === 'POTENTIAL_CLIENT') {
                await tx.insert(clientProspects).values({
                    leadId: id,
                    address: data.address,
                    squareMeters: data.squareMeters,
                    materials: data.materials,
                    hasBlueprints: data.hasBlueprints,
                    requirementsDetail: data.requirementsDetail,
                });
            } else if (data.category === 'JOB_CANDIDATE' || data.category === 'SERVICE_OFFER') {
                await tx.insert(businessResources).values({
                    leadId: id,
                    companyName: data.companyName,
                    offerDetails: data.offerDetails,
                    cvAnalysisSummary: data.cvAnalysisSummary,
                    fileUrl: data.fileUrl,
                });
            } else if (data.category === 'CONFUSED' || data.category === 'NO_RESPONSE' || data.category === 'NOT_INTERESTED') {
                await tx.insert(leadDiscardReasons).values({
                    leadId: id,
                    reasonDetail: data.reasonDetail,
                });
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error updating lead:", error);
        return { success: false, error: (error as Error).message };
    }
}

// "Archive" renamed/modified to "Delete and Record"
export async function archiveLead(id: string, reason: string, category: string, period: string) {
    try {
        await db.transaction(async (tx) => {
            // 1. Get lead data before deleting
            const leadData = await tx.select({ 
                brand: leads.brand,
                kommoId: leads.kommoId,
                contactName: leads.contactName,
                phone: leads.phone
            }).from(leads).where(eq(leads.id, id)).get();
            
            if (leadData) {
                // 2. Record the discard event in historical stats with full audit data
                await tx.insert(discardedLeadsStats).values({
                    id: crypto.randomUUID(),
                    brand: leadData.brand,
                    category: category || 'NO_RESPONSE',
                    reason: reason,
                    period: period,
                    kommoId: leadData.kommoId,
                    contactName: leadData.contactName,
                    phone: leadData.phone,
                    discardedAt: new Date().toISOString()
                });
            }

            // 3. Delete from leads (cascade handles extensions)
            await tx.delete(leads).where(eq(leads.id, id));
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error deleting lead:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function createDirectDiscard(data: {
    brand: "AZUR" | "COCINAPRO",
    category: string,
    reason: string,
    period: string,
    kommoId?: string,
    contactName?: string,
    phone?: string
}) {
    try {
        await db.insert(discardedLeadsStats).values({
            id: crypto.randomUUID(),
            brand: data.brand,
            category: data.category,
            reason: data.reason,
            period: data.period,
            kommoId: data.kommoId,
            contactName: data.contactName,
            phone: data.phone,
            discardedAt: new Date().toISOString()
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error creating historical record:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function moveToFollowUp(id: string) {
    try {
        await db.update(leads)
            .set({ category: 'MANUAL_FOLLOW_UP' })
            .where(eq(leads.id, id));
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error moving lead to follow up:", error);
        return { success: false, error: (error as Error).message };
    }
}
export async function putOnHold(id: string) {
    try {
        await db.update(leads)
            .set({ status: 'ON_HOLD' })
            .where(eq(leads.id, id));
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error putting lead on hold:", error);
        return { success: false, error: (error as Error).message };
    }
}
export async function updateLeadSubStatus(id: string, subStatus: 'SIN_FECHA' | 'ESPERANDO_RESPUESTA' | 'EN_EJECUCION') {
    try {
        await db.update(leads)
            .set({ subStatus })
            .where(eq(leads.id, id));
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error updating subStatus:", error);
        return { success: false, error: (error as Error).message };
    }
}
export async function updateLeadStatus(id: string, status: 'PENDING' | 'ARCHIVED' | 'WAITING_FOR_DATE' | 'SCHEDULED' | 'ON_HOLD' | 'IN_EXECUTION' | 'REVISION', note?: string) {
    try {
        await db.transaction(async (tx) => {
            await tx.update(leads)
                .set({ status })
                .where(eq(leads.id, id));

            if (note) {
                // If it's a waiting/hold status, we can store the reason in leadDiscardReasons even if not "discarded"
                // or ensure it exists
                const existing = await tx.select().from(leadDiscardReasons).where(eq(leadDiscardReasons.leadId, id));
                if (existing.length > 0) {
                    await tx.update(leadDiscardReasons)
                        .set({ reasonDetail: note })
                        .where(eq(leadDiscardReasons.leadId, id));
                } else {
                    await tx.insert(leadDiscardReasons)
                        .values({ leadId: id, reasonDetail: note });
                }
            }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error updating lead status:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateLeadKanbanStep(id: string, kanbanStep: number) {
    try {
        await db.update(leads)
            .set({ kanbanStep })
            .where(eq(leads.id, id));
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error updating kanbanStep:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateLeadCategory(id: string, category: 'SERVICE_OFFER' | 'JOB_CANDIDATE' | 'NO_RESPONSE' | 'NOT_INTERESTED' | 'CONFUSED' | 'POTENTIAL_CLIENT' | 'MANUAL_FOLLOW_UP' | 'LEAD_ALL' | 'REVISION') {
    try {
        await db.update(leads)
            .set({ category })
            .where(eq(leads.id, id));
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error updating category:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function searchDiscardedLeads(searchTerm: string) {
    try {
        const term = searchTerm.trim();
        const condition = term ? or(
            like(discardedLeadsStats.kommoId, `%${term}%`),
            like(discardedLeadsStats.contactName, `%${term}%`)
        ) : undefined;
        
        const results = await db.select()
            .from(discardedLeadsStats)
            .where(condition)
            .orderBy(desc(discardedLeadsStats.discardedAt))
            .limit(100);
        return results;
    } catch (error) {
        console.error("Error searching discarded leads:", error);
        return [];
    }
}
