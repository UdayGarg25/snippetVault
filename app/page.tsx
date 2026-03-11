"use client";

import Link from "next/link";
import { Code2, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center gap-6">
        <Code2 className="size-16 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          SnippetVault
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Save, organize, and share your code snippets with syntax highlighting
          and image export.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link
            href="/auth/login"
            className={buttonVariants({ size: "lg" })}
          >
            Sign In
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link
            href="/auth/signup"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Create Account
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
