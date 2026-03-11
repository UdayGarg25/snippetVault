// Supported programming languages for snippet syntax highlighting
export const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
  "bash",
  "json",
  "yaml",
  "markdown",
  "docker",
] as const;

export type Language = (typeof LANGUAGES)[number];
