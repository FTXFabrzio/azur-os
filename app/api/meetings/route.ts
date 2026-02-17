import { NextResponse } from "next/server";
import { getMeetings } from "@/lib/actions/meetings";
import { getSession } from "@/lib/actions/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // getMeetings() now internally performs RBAC based on session
  const meetings = await getMeetings();
  return NextResponse.json(meetings);
}
