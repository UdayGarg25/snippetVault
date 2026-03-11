import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicSnippetContent } from "@/components/public-snippet-content";
import type { Snippet } from "@/types/snippet";
import type { Profile } from "@/types/profile";

export default async function PublicSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS controls visibility: public snippets, owner's own, or shared snippets
  const { data: snippet } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", id)
    .single<Snippet>();

  if (!snippet) {
    notFound();
  }

  // Fetch author profile
  const { data: author } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", snippet.user_id)
    .single<Pick<Profile, "username" | "display_name" | "avatar_url">>();

  return (
    <PublicSnippetContent
      snippet={snippet}
      authorName={author?.display_name || author?.username || "Anonymous"}
      authorUsername={author?.username ?? null}
    />
  );
}
