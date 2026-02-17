import "dotenv/config";
import { db } from "./lib/db";
import { meetings, meetingParticipants } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function translateDataRefined() {
  console.log("Refining data translation to Spanish (Masculine/Neutral)...");

  try {
    // 1. Update meetings Table
    await db.update(meetings)
      .set({ status: "PENDIENTE" as any })
      .where(eq(meetings.status, "PENDING" as any));
    
    await db.update(meetings)
      .set({ status: "CONFIRMADA" as any })
      .where(eq(meetings.status, "CONFIRMED" as any));
    
    // 2. Update meetingParticipants Table
    await db.update(meetingParticipants)
      .set({ status: "ESPERANDO" as any })
      .where(eq(meetingParticipants.status, "WAITING" as any));
    
    await db.update(meetingParticipants)
      .set({ status: "ACEPTADO" as any })
      .where(eq(meetingParticipants.status, "ACCEPTED" as any));

    await db.update(meetingParticipants)
      .set({ status: "ACEPTADO" as any })
      .where(eq(meetingParticipants.status, "ACEPTADA" as any));
    
    await db.update(meetingParticipants)
      .set({ status: "RECHAZADO" as any })
      .where(eq(meetingParticipants.status, "REJECTED" as any));

    await db.update(meetingParticipants)
      .set({ status: "RECHAZADO" as any })
      .where(eq(meetingParticipants.status, "RECHAZADA" as any));

    console.log("Data refinement complete!");
    process.exit(0);
  } catch (error) {
    console.error("Refinement failed:", error);
    process.exit(1);
  }
}

translateDataRefined();
