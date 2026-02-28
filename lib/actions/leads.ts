"use server"

import { db } from "@/lib/db";
import { leads, clientProspects, businessResources, leadDiscardReasons } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
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

export async function getLeadsStats() {
  try {
    const totalLeads = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const toSchedule = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, 'PENDING'));
    const waiting = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, 'WAITING_FOR_DATE'));
    const inExecution = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, 'IN_EXECUTION'));
    const onHold = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, 'ON_HOLD'));
    
    // Noise: CONFUSED + NOT_INTERESTED
    const noiseLeads = await db.select({ count: sql<number>`count(*)` }).from(leads).where(
      sql`${leads.category} IN ('CONFUSED', 'NOT_INTERESTED')`
    );

    const brands = await db.select({ 
      brand: leads.brand, 
      count: sql<number>`count(*)` 
    }).from(leads).groupBy(leads.brand);

    const categories = await db.select({
      category: leads.category,
      count: sql<number>`count(*)`
    }).from(leads).groupBy(leads.category);

    const azurCount = brands.find(b => b.brand === 'AZUR')?.count || 0;
    const cocinaCount = brands.find(b => b.brand === 'COCINAPRO')?.count || 0;

    return {
      total: totalLeads[0].count,
      toSchedule: toSchedule[0].count,
      waiting: waiting[0].count,
      inExecution: inExecution[0].count,
      onHold: onHold[0].count,
      noiseRate: totalLeads[0].count > 0 ? (noiseLeads[0].count / totalLeads[0].count) * 100 : 0,
      azurCount,
      cocinaCount,
      categories: categories.reduce((acc: any, curr) => {
        acc[curr.category] = curr.count;
        return acc;
      }, {}),
    };
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    return { total: 0, toSchedule: 0, noiseRate: 0, azurCount: 0, cocinaCount: 0 };
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

export async function archiveLead(id: string) {
    try {
        await db.update(leads)
            .set({ status: 'ARCHIVED' })
            .where(eq(leads.id, id));
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error archiving lead:", error);
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
export async function updateLeadStatus(id: string, status: 'PENDING' | 'ARCHIVED' | 'WAITING_FOR_DATE' | 'SCHEDULED' | 'ON_HOLD' | 'IN_EXECUTION', note?: string) {
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
