import { getMeetings } from "@/lib/actions/meetings";
import { WorkDashboardContent } from "./work-dashboard-content";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { redirect } from "next/navigation";

export default async function DashboardWorkPage() {
  const [meetings, cookieStore] = await Promise.all([
    getMeetings(),
    cookies()
  ]);

  const sessionData = cookieStore.get("auth_session");
  let user = null;
  if (sessionData?.value) {
    try {
      user = JSON.parse(sessionData.value);
    } catch (e) {
      console.error("Error parsing user session:", e);
    }
  }

  // Handle redirect outside of try-catch block
  if (user?.role === 'SALES_MANAGER') {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <WorkDashboardContent initialMeetings={meetings} user={user} />
    </Suspense>
  );
}
