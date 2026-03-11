# SnippetVault — Complete Setup Guide

> A public code snippet manager built with Next.js, Supabase, TailwindCSS, and shadcn/ui.

---

## Tech Stack

| Category           | Technology                          |
| ------------------ | ----------------------------------- |
| Framework          | Next.js 16 (App Router, TypeScript) |
| Styling            | TailwindCSS v4 + shadcn/ui         |
| State Management   | TanStack Query v5 + Zustand         |
| Backend & Auth     | Supabase (Auth + Postgres)          |
| Code Preview       | react-syntax-highlighter            |
| Image Export       | html-to-image                       |
| Linting/Formatting | ESLint + Prettier                   |

---

## 1. Create the Next.js Project

```bash
npx create-next-app@latest snippetvault --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd snippetvault
```

---

## 2. Install All Dependencies

### Core dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query zustand react-syntax-highlighter html-to-image next-themes
```

### Dev dependencies

```bash
npm install -D @types/react-syntax-highlighter prettier eslint-config-prettier eslint-plugin-prettier
```

---

## 3. TailwindCSS (already configured by create-next-app)

TailwindCSS v4 is pre-configured. The `postcss.config.mjs` uses `@tailwindcss/postcss` plugin. No additional setup needed.

---

## 4. Initialize shadcn/ui

```bash
npx shadcn@latest init -d
```

Then add the components you need:

```bash
npx shadcn@latest add button input textarea select dialog popover badge sheet sonner switch separator skeleton card dropdown-menu avatar tooltip tabs
```

---

## 5. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase — get from https://supabase.com/dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Important:** `.env*` is already in `.gitignore`. Never commit real keys.

---

## 6. Supabase Client Setup

Three files handle Supabase across different contexts:

| File                        | Purpose                              |
| --------------------------- | ------------------------------------ |
| `lib/supabase/client.ts`    | Browser client (Client Components)   |
| `lib/supabase/server.ts`    | Server client (Server Components/API)|
| `lib/supabase/middleware.ts` | Session refresh in middleware        |

Plus `middleware.ts` at root for auth session management.

### Supabase SQL — Create tables

Run this in Supabase SQL Editor:

```sql
-- Profiles table (auto-created on signup via trigger)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snippets table
CREATE TABLE snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies: snippets
CREATE POLICY "Public snippets are viewable by everyone"
  ON snippets FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own snippets"
  ON snippets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create snippets"
  ON snippets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snippets"
  ON snippets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snippets"
  ON snippets FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 7. TanStack Query Setup

The `QueryProvider` in `providers/query-provider.tsx` wraps the app with `QueryClientProvider` and sets default options (1-minute stale time, no refetch on window focus).

Already wired into `app/layout.tsx`.

---

## 8. Zustand Store Setup

The UI store at `stores/ui-store.ts` manages:
- Sidebar open/close state
- Editor language selection
- Search query and tag filters
- Grid/list view mode toggle

Usage example:
```tsx
import { useUIStore } from "@/stores/ui-store";

function MyComponent() {
  const { searchQuery, setSearchQuery, viewMode, setViewMode } = useUIStore();
  // ...
}
```

---

## 9. Project Folder Structure

```
snippetvault/
├── app/
│   ├── globals.css              # Tailwind + shadcn theme
│   ├── layout.tsx               # Root layout (providers wrapped)
│   ├── page.tsx                 # Landing / Home page
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   ├── signup/page.tsx      # Signup page
│   │   └── callback/route.ts    # OAuth callback handler
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout (sidebar)
│   │   └── page.tsx             # User's snippets dashboard
│   ├── explore/
│   │   └── page.tsx             # Browse public snippets
│   └── snippet/
│       └── [id]/page.tsx        # Single snippet detail view
├── components/
│   └── ui/                      # shadcn/ui components (auto-generated)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── ... (16 components)
├── hooks/
│   ├── use-auth.ts              # Auth hooks (useAuth, useUser)
│   └── use-snippets.ts          # Snippet CRUD hooks (TanStack Query)
├── lib/
│   ├── constants.ts             # Language list, app constants
│   ├── utils.ts                 # cn() helper (shadcn)
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       ├── server.ts            # Server Supabase client
│       └── middleware.ts        # Session refresh logic
├── providers/
│   ├── query-provider.tsx       # TanStack Query provider
│   └── theme-provider.tsx       # Dark/light theme provider
├── stores/
│   └── ui-store.ts              # Zustand UI state store
├── types/
│   ├── index.ts                 # Re-exports
│   ├── snippet.ts               # Snippet type definitions
│   └── profile.ts               # Profile type definitions
├── middleware.ts                 # Next.js middleware (auth)
├── .env.local                   # Environment variables (not committed)
├── .env.example                 # Template for env vars
├── .prettierrc                  # Prettier config
├── .prettierignore              # Prettier ignore
├── components.json              # shadcn/ui config
├── eslint.config.mjs            # ESLint config
├── next.config.ts               # Next.js config
├── postcss.config.mjs           # PostCSS (TailwindCSS)
├── tailwind.config.ts           # (if needed — v4 uses CSS-based config)
├── tsconfig.json                # TypeScript config
└── package.json
```

---

## 10. Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without writing
```

---

## 11. Getting Started

```bash
# 1. Clone and install
cd snippetvault
npm install

# 2. Set up Supabase
#    - Create a project at https://supabase.com
#    - Run the SQL from section 6 in the SQL Editor
#    - Copy URL and anon key to .env.local

# 3. Start developing
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building!
