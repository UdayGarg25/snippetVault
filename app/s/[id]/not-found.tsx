import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function SnippetNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <FileQuestion className="mb-4 size-16 text-muted-foreground" />
      <h1 className="mb-2 text-2xl font-bold">Snippet not found</h1>
      <p className="mb-6 text-muted-foreground">
        This snippet doesn&apos;t exist or is private.
      </p>
      <Link href="/explore" className={buttonVariants()}>
        Browse Public Snippets
      </Link>
    </div>
  );
}
