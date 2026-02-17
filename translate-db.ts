import "dotenv/config";
import { db } from "./lib/db";
import { meetings, meetingParticipants } from "./lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function translateData() {
  console.log("Translating existing data to Spanish...");

  try {
    // 1. Update meetings Table
    // PENDING -> PENDIENTE
    // CONFIRMED -> CONFIRMADA
    // CANCELLED -> CANCELADA
    // COMPLETED -> COMPLETADA
    
    await db.update(meetings)
      .set({ status: "PENDIENTE" as any })
      .where(eq(meetings.status, "PENDING" as any));
    
    await db.update(meetings)
      .set({ status: "CONFIRMADA" as any })
      .where(eq(meetings.status, "CONFIRMED" as any));
    
    await db.update(meetings)
      .set({ status: "CANCELADA" as any })
      .where(eq(meetings.status, "CANCELLED" as any));
    
    await db.update(meetings)
      .set({ status: "COMPLETADA" as any })
      .where(eq(meetings.status, "COMPLETED" as any));

    console.log("Meetings translated.");

    // 2. Update meetingParticipants Table
    // WAITING -> ESPERANDO
    // ACCEPTED -> ACEPTADA
    // REJECTED -> RECHAZADA
    
    await db.update(meetingParticipants)
      .set({ status: "ESPERANDO" as any })
      .where(eq(meetingParticipants.status, "WAITING" as any));
    
    await db.update(meetingParticipants)
      .set({ status: "ACEPTADA" as any })
      .where(eq(meetingParticipants.status, "ACCEPTED" as any));
    
    await db.update(meetingParticipants)
      .set({ status: "RECHAZADA" as any })
      .where(eq(meetingParticipants.status, "REJECTED" as any));

    console.log("Participants translated.");
    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

translateData();
