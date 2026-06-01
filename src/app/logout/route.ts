import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

/** GET /logout — cierra sesión y vuelve al login (útil si quedaste con cookies viejas). */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // continuar
  }

  const login = new URL("/login", request.url);
  login.searchParams.set(
    "message",
    "Sesión cerrada. Usa el usuario de tu proyecto Supabase actual.",
  );
  return NextResponse.redirect(login);
}
