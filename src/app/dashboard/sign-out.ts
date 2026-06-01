"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Si falla Supabase, igual redirigimos y el middleware limpiará lo que pueda.
  }
  redirect("/login?message=Sesión+cerrada.+Inicia+sesión+de+nuevo.");
}
