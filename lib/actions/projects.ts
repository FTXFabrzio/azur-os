"use server";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { proyectos, archivosProyectos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getGoogleDriveClient, getDriveAuth } from "@/lib/google-drive";
import { Readable } from "stream";

export async function getProjects(listOnly: boolean = false) {
  const fetchFn = async () => {
    try {
      if (listOnly) {
        return await db.query.proyectos.findMany({
          columns: {
            id: true,
            nombre: true,
            codigo: true,
            driveFolderLink: true,
            createdAt: true,
          },
          with: {
            archivos: {
              columns: {
                id: true,
              }
            }
          },
          orderBy: [desc(proyectos.createdAt)]
        });
      }

      return await db.query.proyectos.findMany({
        with: {
          archivos: true
        },
        orderBy: [desc(proyectos.createdAt)]
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  };

  // Senior Optimization: Server-side caching with ISR (60s)
  const cachedFetch = unstable_cache(fetchFn, ["projects-list", listOnly.toString()], {
    revalidate: 60,
    tags: ["projects"]
  });

  return cachedFetch();
}

export async function createProject(name: string, code: string) {
  try {
    const drive = await getGoogleDriveClient();
    const parentFolder = process.env.CREDENTIAL_FOLDER;

    if (!parentFolder) {
      throw new Error("CREDENTIAL_FOLDER not defined");
    }

    // 1. Create folder in Drive
    console.log(`[Drive] 📁 Creando carpeta: "${code}"`);
    const folderResponse = await drive.files.create({
      requestBody: {
        name: code,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolder],
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    const folderId = folderResponse.data.id;
    const folderLink = folderResponse.data.webViewLink;

    if (!folderId) throw new Error("Failed to create Drive folder");

    // 2. Create entry in DB
    const projectId = uuidv4();
    await db.insert(proyectos).values({
      id: projectId,
      nombre: name,
      codigo: code,
      driveFolderLink: folderLink || null,
    });

    revalidatePath("/dashboard");

    return { success: true, data: { id: projectId, driveFolderId: folderId } };
  } catch (error: any) {
    console.error("Error creating project:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadProjectFile(params: {
  projectId: string;
  driveFolderId: string;
  fileName: string;
  mimeType: string;
  base64Data: string;
  sizeKb: number;
  etiqueta?: string;
  descripcion?: string;
}) {
  try {
    const drive = await getGoogleDriveClient();
    
    // Convert base64 to buffer for Drive
    const base64String = params.base64Data.includes(',') ? params.base64Data.split(',')[1] : params.base64Data;
    const buffer = Buffer.from(base64String, 'base64');
    
    // 1. Upload to Drive
    console.log(`[Drive] ⬆️ Subiendo archivo: "${params.fileName}"`);
    const fileResponse = await drive.files.create({
      requestBody: {
        name: params.fileName,
        parents: [params.driveFolderId],
      },
      media: {
        mimeType: params.mimeType,
        body: Readable.from(buffer),
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    const driveFileId = fileResponse.data.id;
    const driveFileLink = fileResponse.data.webViewLink;

    if (!driveFileId || !driveFileLink) throw new Error("Failed to upload file to Drive");

    // 2. Save to DB
    const fileId = uuidv4();
    await db.insert(archivosProyectos).values({
      id: fileId,
      proyectoId: params.projectId,
      etiqueta: params.etiqueta || params.fileName.split('.').pop()?.toUpperCase() || "FILE",
      descripcion: params.descripcion || params.fileName,
      driveFileLink: driveFileLink,
      pesoKb: Math.round(params.sizeKb),
    });

    revalidatePath("/dashboard");
    return { success: true, data: { id: fileId, driveFileId } };
  } catch (error: any) {
    console.error("Error uploading project file:", error);
    return { success: false, error: error.message };
  }
}

export async function findProjectByCode(code: string) {
  try {
    // 1. Find project in DB
    const cleanCode = code.trim().toUpperCase();
    const project = await db.query.proyectos.findFirst({
      where: eq(proyectos.codigo, cleanCode),
      with: {
        archivos: true
      }
    });

    if (!project) {
      return { success: false, error: 'PROJECT_NOT_FOUND' };
    }

    // 2. Look for the "3D" file or the first file
    // Ideally one containing .glb or marked with a specific tag
    const modelFile = project.archivos.find(f => 
      f.driveFileLink.toLowerCase().includes('.glb') || 
      f.etiqueta?.toUpperCase().includes('3D') ||
      f.descripcion?.toUpperCase().includes('3D')
    ) || project.archivos[0];

    if (!modelFile) {
      return { success: false, error: 'MODEL_NOT_FOUND' };
    }

    // Extract fileId from the Drive link
    // Formats: 
    // https://drive.google.com/file/d/FILE_ID/view
    // https://drive.google.com/open?id=FILE_ID
    let fileId = "";
    const link = modelFile.driveFileLink;
    if (link.includes('/d/')) {
      fileId = link.split('/d/')[1].split('/')[0];
    } else if (link.includes('id=')) {
      fileId = link.split('id=')[1].split('&')[0];
    } else {
      // Fallback if it's already an ID (unlikely given the schema)
      fileId = link;
    }

    return { 
      success: true, 
      data: {
        projectId: project.id,
        fileId: fileId,
        fileName: modelFile.descripcion || modelFile.etiqueta,
        allFiles: project.archivos
      }
    };
  } catch (error: any) {
    console.error("Error finding project by code:", error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}
export async function getDriveFolderByCode(code: string) {
  try {
    const drive = await getGoogleDriveClient();
    const parentFolder = process.env.CREDENTIAL_FOLDER;

    const response = await drive.files.list({
      q: `name = '${code}' and '${parentFolder}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const folder = response.data.files?.[0];
    return folder?.id || null;
  } catch (error) {
    console.error("Error finding drive folder:", error);
    return null;
  }
}
export async function initiateResumableUpload(params: {
  fileName: string;
  mimeType: string;
  driveFolderId: string;
}) {
  try {
    const auth = await getDriveAuth();
    const token = await auth.getAccessToken();

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': params.mimeType,
      },
      body: JSON.stringify({
        name: params.fileName,
        parents: [params.driveFolderId],
      }),
    });

    const location = response.headers.get('location');
    if (!location) throw new Error("Failed to get resumable upload location");
    
    return { success: true, uploadUrl: location };
  } catch (error: any) {
    console.error("Error initiating resumable upload:", error);
    return { success: false, error: error.message };
  }
}

export async function completeResumableUpload(params: {
  projectId: string;
  fileId: string;
  etiqueta: string;
  descripcion: string;
  sizeKb: number;
}) {
  try {
    const drive = await getGoogleDriveClient();
    
    // Get file details to get webViewLink
    const fileResponse = await drive.files.get({
      fileId: params.fileId,
      fields: 'id, webViewLink, name',
      supportsAllDrives: true,
    });

    const driveFileId = fileResponse.data.id;
    const driveFileLink = fileResponse.data.webViewLink;

    if (!driveFileId || !driveFileLink) throw new Error("Failed to retrieve file info from Drive");

    // Save to DB
    const dbFileId = uuidv4();
    await db.insert(archivosProyectos).values({
      id: dbFileId,
      proyectoId: params.projectId,
      etiqueta: params.etiqueta,
      descripcion: params.descripcion,
      driveFileLink: driveFileLink,
      pesoKb: Math.round(params.sizeKb),
    });

    revalidatePath("/dashboard");
    return { success: true, data: { id: dbFileId, driveFileId } };
  } catch (error: any) {
    console.error("Error completing resumable upload:", error);
    return { success: false, error: error.message };
  }
}

export async function registerProjectFileLink(params: {
  projectId: string;
  etiqueta: string;
  descripcion: string;
  driveFileLink: string;
}) {
  try {
    const fileId = uuidv4();
    await db.insert(archivosProyectos).values({
      id: fileId,
      proyectoId: params.projectId,
      etiqueta: params.etiqueta,
      descripcion: params.descripcion,
      driveFileLink: params.driveFileLink,
      pesoKb: 0,
    });

    revalidatePath("/dashboard");
    return { success: true, data: { id: fileId } };
  } catch (error: any) {
    console.error("Error registering file link:", error);
    return { success: false, error: error.message };
  }
}
