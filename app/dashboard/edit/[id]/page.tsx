import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SnippetForm } from "@/components/snippet-form";
import type { Snippet } from "@/types/snippet";

export default async function EditSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: snippet } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<Snippet>();

  if (!snippet) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SnippetForm snippet={snippet} />
    </div>
  );
}
