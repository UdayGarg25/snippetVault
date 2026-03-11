import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // AuthSessionMissingError is expected when a user is not logged in.
  // Treat it as an unauthenticated state instead of throwing.
  // Refresh the auth token — if the JWT references a deleted user,
  // clear the invalid session cookies and allow navigation to continue.
  try {
    const { error } = await supabase.auth.getUser();
    if (error) {
      await supabase.auth.signOut();
    }
  } catch {
    // Session missing or corrupt — clear cookies so the request proceeds clean
    await supabase.auth.signOut();
  }

  return supabaseResponse;
}
