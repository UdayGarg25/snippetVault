"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CodeViewer } from "@/components/code-viewer";
import { ShareMenu } from "@/components/share-menu";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Snippet } from "@/types/snippet";

interface PublicSnippetContentProps {
  snippet: Snippet;
  authorName: string;
  authorUsername: string | null;
}

export function PublicSnippetContent({
  snippet,
  authorName,
  authorUsername,
}: PublicSnippetContentProps) {
  const codeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Link
          href="/explore"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Explore
        </Link>
        <ShareMenu snippetId={snippet.id} codeRef={codeRef} />
      </div>

      <div className="mt-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {snippet.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {authorUsername ? (
              <Link
                href={`/u/${authorUsername}`}
                className="hover:text-foreground hover:underline"
              >
                by {authorName}
              </Link>
            ) : (
              <span>by {authorName}</span>
            )}
            <span>&middot;</span>
            <span>
              {new Date(snippet.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {snippet.description && (
            <p className="text-muted-foreground">{snippet.description}</p>
          )}
        </div>

        {/* Language + tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{snippet.language}</Badge>
          {snippet.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Code */}
        <div ref={codeRef}>
          <CodeViewer code={snippet.code} language={snippet.language} />
        </div>
      </div>
    </div>
  );
}
