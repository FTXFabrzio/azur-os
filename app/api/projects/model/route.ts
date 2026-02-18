import { NextRequest, NextResponse } from "next/server";
import { getGoogleDriveClient } from "@/lib/google-drive";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } | any }
) {
  try {
    const { code } = await params;
    const drive = await getGoogleDriveClient();
    
    // We need to find the file ID again or pass it. 
    // To be secure and simple, let's just use the file ID directly if we had a session, 
    // but here let's re-find it to be robust or expect a query param with fileId.
    
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return new NextResponse("File ID required", { status: 400 });
    }

    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Stream the file back to the client
    return new NextResponse(response.data as any, {
      headers: {
        'Content-Type': 'model/gltf-binary', // Standard for .glb
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return new NextResponse("Error fetching model", { status: 500 });
  }
}
