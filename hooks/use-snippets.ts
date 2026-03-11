import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Snippet } from "@/types/snippet";

export function useSnippets(userId: string) {
  return useQuery({
    queryKey: ["snippets", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("snippets")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .returns<Snippet[]>();

      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snippetId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("snippets")
        .delete()
        .eq("id", snippetId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    },
  });
}
