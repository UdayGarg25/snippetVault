"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, LayoutDashboard, Compass, LogIn, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // AuthSessionMissingError is expected when a user is not logged in.
    // Treat it as an unauthenticated state instead of throwing.
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error) {
          supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        setUser(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Code2 className="size-5 text-primary" />
          SnippetVault
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <LayoutDashboard className="mr-1.5 size-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" size="sm">
              <Compass className="mr-1.5 size-4" />
              Explore
            </Button>
          </Link>

          {user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1.5 size-4" />
              Logout
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <LogIn className="mr-1.5 size-4" />
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
