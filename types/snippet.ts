export type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type SnippetInsert = Omit<Snippet, "id" | "created_at" | "updated_at">;
export type SnippetUpdate = Partial<SnippetInsert>;
