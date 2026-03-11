"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { LANGUAGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Snippet } from "@/types/snippet";

interface SnippetFormProps {
  /** Pass an existing snippet to enable edit mode */
  snippet?: Snippet;
}

export function SnippetForm({ snippet }: SnippetFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!snippet;

  const [title, setTitle] = useState(snippet?.title ?? "");
  const [language, setLanguage] = useState(snippet?.language ?? "javascript");
  const [description, setDescription] = useState(snippet?.description ?? "");
  const [code, setCode] = useState(snippet?.code ?? "");
  const [tagsInput, setTagsInput] = useState(
    snippet?.tags?.join(", ") ?? "",
  );
  const [isPublic, setIsPublic] = useState(snippet?.is_public ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required.";
    if (!code.trim()) newErrors.code = "Code is required.";
    if (!language) newErrors.language = "Language is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function parseTags(input: string): string[] {
    return input
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitError("You must be logged in.");
      setLoading(false);
      return;
    }

    const payload = {
      title: title.trim(),
      language,
      description: description.trim() || null,
      code: code.trimEnd(),
      tags: parseTags(tagsInput),
      is_public: isPublic,
      user_id: user.id,
    };

    if (isEdit && snippet) {
      const { error } = await supabase
        .from("snippets")
        .update(payload)
        .eq("id", snippet.id);

      if (error) {
        setSubmitError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("snippets").insert(payload);

      if (error) {
        setSubmitError(error.message);
        setLoading(false);
        return;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["snippets"] });
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {isEdit ? "Edit Snippet" : "Create New Snippet"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {submitError && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              placeholder="e.g. React useDebounce hook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Language <span className="text-destructive">*</span>
            </label>
            <Select
              value={language}
              onValueChange={(val) => {
                if (val) setLanguage(val);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-xs text-destructive">{errors.language}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Code */}
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Code <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="code"
              placeholder="Paste your code here..."
              className="min-h-[200px] font-mono text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <Input
              id="tags"
              placeholder="react, hooks, debounce"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of tags
            </p>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Public</p>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? "Anyone can view this snippet"
                  : "Only you can see this snippet"}
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save Changes"
                : "Create Snippet"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
