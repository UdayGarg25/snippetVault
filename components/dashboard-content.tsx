"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { useSnippets, useDeleteSnippet } from "@/hooks/use-snippets";
import { useUIStore } from "@/stores/ui-store";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SnippetCard } from "@/components/snippet-card";
import type { Snippet } from "@/types/snippet";

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const router = useRouter();

  // TanStack Query — server state
  const { data: snippets, isLoading, isError } = useSnippets(userId);
  const deleteMutation = useDeleteSnippet();

  // Zustand — UI state
  const { searchQuery, setSearchQuery, selectedTags, toggleTag } =
    useUIStore();

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<Snippet | null>(null);

  // Filtered snippets (client-side)
  const filtered = snippets?.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q));

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => s.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  // All unique tags from user's snippets
  const allTags = [...new Set(snippets?.flatMap((s) => s.tags) ?? [])].sort();

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Snippet deleted");
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Failed to delete snippet");
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Snippets</h1>
          <p className="mt-1 text-muted-foreground">
            {snippets?.length ?? 0} snippet
            {snippets?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/new" className={buttonVariants()}>
          <Plus className="mr-2 size-4" />
          New Snippet
        </Link>
      </div>

      {/* Search + tag filters */}
      <div className="mb-6 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search snippets…"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => useUIStore.getState().setSelectedTags([])}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Loading state — Skeleton cards */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load snippets. Please try again later.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && (!filtered || filtered.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="mb-1 text-lg font-medium">
            {searchQuery || selectedTags.length > 0
              ? "No matching snippets"
              : "No snippets yet"}
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            {searchQuery || selectedTags.length > 0
              ? "Try a different search or clear your filters."
              : "Create your first code snippet to get started."}
          </p>
          {!searchQuery && selectedTags.length === 0 && (
            <Link href="/dashboard/new" className={buttonVariants()}>
              <Plus className="mr-2 size-4" />
              New Snippet
            </Link>
          )}
        </div>
      )}

      {/* Snippet grid */}
      {!isLoading && filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={() => router.push(`/dashboard/edit/${snippet.id}`)}
              onDelete={() => setDeleteTarget(snippet)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Snippet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
