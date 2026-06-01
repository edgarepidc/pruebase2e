import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export type AppSession = {
  email: string;
  canEdit: boolean;
};

function parseAllowedEditors(): string[] | null {
  const raw = process.env.ALLOWED_EDIT_EMAILS?.trim();
  if (!raw) return null;
  return raw
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function canEditEmail(email: string): boolean {
  const allowed = parseAllowedEditors();
  if (!allowed) return true;
  return allowed.includes(email.trim().toLowerCase());
}

export async function getAppSession(): Promise<AppSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;
    return {
      email: user.email,
      canEdit: canEditEmail(user.email),
    };
  } catch {
    return null;
  }
}

export async function requireAppSession(): Promise<AppSession> {
  const session = await getAppSession();
  if (!session) redirect("/login");
  return session;
}
