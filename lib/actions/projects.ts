"use server";

import { getGoogleDriveClient } from "@/lib/google-drive";

export async function findProjectByCode(code: string) {
  try {
    const drive = await getGoogleDriveClient();
    
    // Normalize and trim: avoid empty spaces or redundant "3dazur"
    const trimmedCode = code.trim();
    const cleanCode = trimmedCode.startsWith('3dazur') ? trimmedCode.replace('3dazur', '') : trimmedCode;
    const folderName = `3dazur${cleanCode}`;
    const parentFolder = process.env.CREDENTIAL_FOLDER;

    console.log(`[Drive] 🔍 Buscando carpeta: "${folderName}"`);
    console.log(`[Drive] 📁 Carpeta Padre ID: "${parentFolder}"`);

    if (!parentFolder) {
      console.error("[Drive] ❌ CREDENTIAL_FOLDER no está definido en el .env");
      return { success: false, error: 'CONFIG_ERROR' };
    }

    // 1. Find the subfolder
    const folderResponse = await drive.files.list({
      q: `name = '${folderName}' and '${parentFolder}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    const folder = folderResponse.data.files?.[0];
    
    if (!folder || !folder.id) {
      console.warn(`[Drive] ⚠️ No se encontró la carpeta: "${folderName}"`);
      
      // DIAGNÓSTICO: Listar qué carpetas SÍ ve la cuenta de servicio en el padre
      try {
        const checkChildren = await drive.files.list({
          q: `'${parentFolder}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(name)',
        });
        const visibleNames = checkChildren.data.files?.map(f => f.name).join(', ') || 'ninguna';
        console.log(`[Drive] 👀 Carpetas visibles en el padre: [${visibleNames}]`);
      } catch (diagError) {
        console.error("[Drive] ❌ Error en diagnóstico de visibilidad:", diagError);
      }
      
      return { success: false, error: 'PROJECT_NOT_FOUND' };
    }

    console.log(`[Drive] ✅ Carpeta encontrada: ${folder.name} (${folder.id})`);

    // 2. Find the .glb file in that folder
    const fileResponse = await drive.files.list({
      q: `'${folder.id}' in parents and name contains '.glb' and trashed = false`,
      fields: 'files(id, name, size)',
    });

    const file = fileResponse.data.files?.[0];
    if (!file || !file.id) {
      console.error(`[Drive] ❌ No se encontró archivo .glb dentro de la carpeta ${folderName}`);
      return { success: false, error: 'MODEL_NOT_FOUND' };
    }

    console.log(`[Drive] ✨ Archivo 3D encontrado: ${file.name}`);

    return { 
      success: true, 
      data: {
        folderId: folder.id,
        fileId: file.id,
        fileName: file.name
      }
    };
  } catch (error: any) {
    console.error('[Drive] 🚨 Error fatal buscando proyecto:', error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}
