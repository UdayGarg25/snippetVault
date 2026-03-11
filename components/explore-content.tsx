"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SnippetCard } from "@/components/snippet-card";
import type { Snippet } from "@/types/snippet";

interface ExploreContentProps {
  snippets: Snippet[] | null;
  error: boolean;
}

export function ExploreContent({ snippets, error }: ExploreContentProps) {
  const [search, setSearch] = useState("");

  const filtered = snippets?.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          <p className="mt-1 text-muted-foreground">
            Discover public snippets shared by the community
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, language, or tag…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <p className="text-sm text-destructive">
          Failed to load snippets. Please try again later.
        </p>
      )}

      {/* Empty state */}
      {!error && filtered?.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium">No snippets found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "No public snippets have been shared yet."}
          </p>
        </div>
      )}

      {/* Snippet grid */}
      {filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  );
}
