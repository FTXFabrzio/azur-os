import { getLeads, getLeadsStats } from "@/lib/actions/leads";
import { ManagerDashboardView } from "./manager-dashboard-view";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "../dashboard/loading";

async function ManagerDashboardContent() {
  const [leads, leadStats] = await Promise.all([
    getLeads(),
    getLeadsStats(),
  ]);

  const cookieStore = await cookies();
  const sessionData = cookieStore.get("auth_session");
  let user = null;
  if (sessionData?.value) {
    try {
      user = JSON.parse(sessionData.value);
    } catch (e) {
      console.error("Error parsing user session:", e);
    }
  }

  return (
    <ManagerDashboardView 
      user={user}
      initialLeads={leads}
      leadStats={leadStats}
    />
  );
}

export default async function ManagerDashboardPage() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("auth_session");
  let user = null;
  if (sessionData?.value) {
    try {
      user = JSON.parse(sessionData.value);
    } catch (e) {
      console.error("Error parsing user session:", e);
    }
  }

  // Auth check for manager
  if (!user || (user.username !== 'manager' && user.username !== 'fortex')) {
    redirect("/work?error=access_denied");
  }

  return (
    <Suspense fallback={<Loading />}>
      <ManagerDashboardContent />
    </Suspense>
  );
}
