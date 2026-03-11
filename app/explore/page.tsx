import { createClient } from "@/lib/supabase/server";
import { ExploreContent } from "@/components/explore-content";
import type { Snippet } from "@/types/snippet";

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: snippets, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .returns<Snippet[]>();

  return <ExploreContent snippets={snippets} error={!!error} />;
}
