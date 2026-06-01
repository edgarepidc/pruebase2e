import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { supabaseAuthCookieOptions } from "@/utils/supabase/cookie-options";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const env = getSupabasePublicEnv();

  if (!env) {
    return NextResponse.redirect(
      new URL("/login?error=supabase-env", url.origin),
    );
  }

  const destination = new URL("/dashboard", url.origin);
  const response = NextResponse.redirect(destination);

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = createServerClient(env.url, env.key, {
    cookieOptions: supabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  return response;
}
