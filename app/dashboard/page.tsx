import { getUsers } from "@/lib/actions/users";
import { getMeetings } from "@/lib/actions/meetings";
import { DashboardView } from "./dashboard-view";

import { cookies } from "next/headers";

export default async function DashboardPage() {
  const [users, meetings, cookieStore] = await Promise.all([
    getUsers(),
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

  // Force strict RBAC check on server component
  if (!user || user.username !== 'fortex') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/work?error=access_denied'` }} />
        <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Redirigiendo... Acceso Denegado</p>
      </div>
    );
  }

  return <DashboardView initialUsers={users} initialMeetings={meetings} user={user} />;
}
