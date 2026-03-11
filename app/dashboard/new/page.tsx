import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SnippetForm } from "@/components/snippet-form";

export const dynamic = "force-dynamic";

export default async function NewSnippetPage() {
  const supabase = await createClient();

  // AuthSessionMissingError is expected when a user is not logged in.
  // Treat it as an unauthenticated state instead of throwing.
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      if (error) await supabase.auth.signOut();
      redirect("/auth/login");
    }
  } catch {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SnippetForm />
    </div>
  );
}
