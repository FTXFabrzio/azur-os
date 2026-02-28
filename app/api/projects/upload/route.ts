import { NextRequest, NextResponse } from "next/server";
import { getGoogleDriveClient } from "@/lib/google-drive";
import { db } from "@/lib/db";
import { archivosProyectos } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { Readable } from "stream";

// App Router doesn't use the old 'config = { api: { bodyParser: false } }' 
// but it supports large bodies automatically if we read them correctly.
// However, we'll keep it as a comment for clarity as per user request context.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;
    const driveFolderId = formData.get("driveFolderId") as string;
    const etiqueta = formData.get("etiqueta") as string;
    const descripcion = formData.get("descripcion") as string;

    if (!file || !projectId || !driveFolderId) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const drive = await getGoogleDriveClient();
    
    // Convert Web File to Node Readable Stream to avoid loading 100% in memory if possible
    // Note: App Router req.formData() might already buffer, but it's better than JSON/Base64
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log(`[API Upload] ⬆️ Transmitiendo datos de alta precisión: "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const fileResponse = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [driveFolderId],
      },
      media: {
        mimeType: file.type,
        body: Readable.from(buffer),
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    const driveFileId = fileResponse.data.id;
    const driveFileLink = fileResponse.data.webViewLink;

    if (!driveFileId || !driveFileLink) throw new Error("Error al sincronizar con Google Drive");

    // Save to DB
    const fileId = uuidv4();
    await db.insert(archivosProyectos).values({
      id: fileId,
      proyectoId: projectId,
      etiqueta: etiqueta || file.name.split('.').pop()?.toUpperCase() || "FILE",
      descripcion: descripcion || file.name,
      driveFileLink: driveFileLink,
      pesoKb: Math.round(file.size / 1024),
    });

    revalidatePath("/dashboard");

    return NextResponse.json({ 
      success: true, 
      data: { id: fileId, driveFileId } 
    });
  } catch (error: any) {
    console.error("Critical error in API upload tunnel:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
