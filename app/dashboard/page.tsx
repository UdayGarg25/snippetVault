import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();

  // AuthSessionMissingError is expected when a user is not logged in.
  // Treat it as an unauthenticated state instead of throwing.
  let user;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      if (error) await supabase.auth.signOut();
      redirect("/auth/login");
    }
    user = data.user;
  } catch {
    redirect("/auth/login");
  }

  return <DashboardContent userId={user.id} />;
}
