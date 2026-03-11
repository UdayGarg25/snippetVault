"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SnippetCard } from "@/components/snippet-card";
import type { Snippet } from "@/types/snippet";
import type { Profile } from "@/types/profile";

interface ProfileContentProps {
  profile: Profile;
  snippets: Snippet[];
}

export function ProfileContent({ profile, snippets }: ProfileContentProps) {
  const displayName = profile.display_name || profile.username || "Anonymous";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {profile.username && (
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {snippets.length} public snippet{snippets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Snippets grid */}
      {snippets.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg font-medium">No public snippets</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This user hasn&apos;t shared any snippets yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  );
}
