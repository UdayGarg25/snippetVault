"use client";

import { useState, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  code: string;
  language: string;
}

export function CodeViewer({ code, language }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Clipboard API not available");
    }
  }, [code]);

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-[#282c34]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <Badge variant="secondary" className="text-xs">
          {language}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-gray-400 hover:text-white"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code block */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.875rem",
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
