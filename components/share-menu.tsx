"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Share2, Link2, Image, Mail, UserPlus, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareMenuProps {
  snippetId: string;
  /** Ref to the DOM node to capture as an image (e.g. the CodeViewer wrapper) */
  codeRef: React.RefObject<HTMLDivElement | null>;
}

export function ShareMenu({ snippetId, codeRef }: ShareMenuProps) {
  const [email, setEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [shareUsername, setShareUsername] = useState("");
  const [sharing, setSharing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${snippetId}`
      : `/s/${snippetId}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link. Try manually.");
    }
  }, [publicUrl]);

  const handleShareEmail = useCallback(() => {
    if (!email.trim()) return;
    const subject = encodeURIComponent("Check out this code snippet");
    const body = encodeURIComponent(
      `Hey, take a look at this snippet:\n\n${publicUrl}`,
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    setEmail("");
  }, [email, publicUrl]);

  const handleExportImage = useCallback(async () => {
    if (!codeRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(codeRef.current, {
        pixelRatio: 2,
        backgroundColor: "#282c34",
      });
      const link = document.createElement("a");
      link.download = `snippet-${snippetId}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image exported!");
    } catch {
      toast.error("Failed to export image.");
    } finally {
      setExporting(false);
    }
  }, [codeRef, snippetId]);

  const handleShareWithUser = useCallback(async () => {
    if (!shareUsername.trim()) return;
    setSharing(true);
    try {
      const supabase = createClient();

      const { data: target } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", shareUsername.trim())
        .single();

      if (!target) {
        toast.error("User not found");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to share");
        return;
      }

      const { error } = await supabase.from("snippet_shares").insert({
        snippet_id: snippetId,
        shared_by: user.id,
        shared_with: target.id,
      });

      if (error) {
        toast.error("Failed to share snippet");
        return;
      }

      toast.success(`Shared with @${shareUsername.trim()}`);
      setShareUsername("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSharing(false);
    }
  }, [shareUsername, snippetId]);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 size-4" />
            Share
          </Button>
        }
      />

      <PopoverContent align="end" className="w-80 p-4">
        <PopoverHeader>
          <PopoverTitle>Share Snippet</PopoverTitle>
        </PopoverHeader>

        {/* Copy public link */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Public link
          </label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={publicUrl}
              className="h-8 text-xs"
              onFocus={(e) => e.target.select()}
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={handleCopyLink}
            >
              {linkCopied ? (
                <Check className="size-4" />
              ) : (
                <Link2 className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Share via email */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Share via email
          </label>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="email"
              placeholder="user@example.com"
              className="h-8 text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleShareEmail()}
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={handleShareEmail}
              disabled={!email.trim()}
            >
              <Mail className="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Share with specific user */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Share with user
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Username"
              className="h-8 text-xs"
              value={shareUsername}
              onChange={(e) => setShareUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleShareWithUser()}
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={handleShareWithUser}
              disabled={!shareUsername.trim() || sharing}
            >
              <UserPlus className="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Export as image */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={handleExportImage}
          disabled={exporting}
        >
          <Image className="mr-2 size-4" />
          {exporting ? "Exporting…" : "Export as Image"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
