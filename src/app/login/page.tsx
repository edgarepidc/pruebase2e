import { redirect } from "next/navigation";

import { getAppSession } from "@/lib/auth/session";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getAppSession();
  if (session) redirect("/dashboard");

  const creds = getSupabasePublicEnv();

  return (
    <LoginForm
      supabaseUrl={creds?.url ?? null}
      supabaseKey={creds?.key ?? null}
    />
  );
}
