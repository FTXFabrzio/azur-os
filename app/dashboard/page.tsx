import { getUsers } from "@/lib/actions/users";
import { getMeetings } from "@/lib/actions/meetings";
import { getProjects } from "@/lib/actions/projects";
import { getLeads, getLeadsStats } from "@/lib/actions/leads";
import { DashboardView } from "./dashboard-view";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

async function DashboardContent() {
  const [users, meetings, projects, leads, leadStats] = await Promise.all([
    getUsers(),
    getMeetings(),
    getProjects(true), // Optimized fields for list
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
    <DashboardView 
      initialUsers={users} 
      initialMeetings={meetings} 
      initialProjects={projects} 
      initialLeads={leads}
      leadStats={leadStats}
      user={user} 
    />
  );
}

export default async function DashboardPage() {
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

  // Quick auth check before even attempting content fetch
  if (!user || user.username !== 'fortex') {
    redirect("/work?error=access_denied");
  }

  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
