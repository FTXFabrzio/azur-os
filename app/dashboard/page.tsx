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

  return <DashboardView initialUsers={users} initialMeetings={meetings} user={user} />;
}
