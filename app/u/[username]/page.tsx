import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "@/components/profile-content";
import type { Snippet } from "@/types/snippet";
import type { Profile } from "@/types/profile";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single<Profile>();

  if (!profile) {
    notFound();
  }

  const { data: snippets } = await supabase
    .from("snippets")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .returns<Snippet[]>();

  return <ProfileContent profile={profile} snippets={snippets ?? []} />;
}
