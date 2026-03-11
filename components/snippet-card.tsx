"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Snippet } from "@/types/snippet";

function getCodePreview(code: string, lines = 3): string {
  return code.split("\n").slice(0, lines).join("\n");
}

interface SnippetCardProps {
  snippet: Snippet;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SnippetCard({ snippet, onEdit, onDelete }: SnippetCardProps) {
  const showActions = !!(onEdit || onDelete);

  return (
    <div className="group relative">
      <Link href={`/s/${snippet.id}`} className="block">
        <Card className="h-full transition-colors hover:border-primary/40">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-1 text-base font-semibold">
                {snippet.title}
              </CardTitle>
              {snippet.is_public ? (
                <Globe className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <Lock className="size-4 shrink-0 text-muted-foreground" />
              )}
            </div>
            <Badge variant="secondary" className="w-fit text-xs">
              {snippet.language}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-3">
            <pre className="overflow-hidden rounded-md bg-muted p-3 text-xs leading-relaxed">
              <code className="line-clamp-3">
                {getCodePreview(snippet.code)}
              </code>
            </pre>

            {snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {snippet.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {showActions && (
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 bg-background/80 shadow-sm backdrop-blur-sm"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" sideOffset={4}>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
