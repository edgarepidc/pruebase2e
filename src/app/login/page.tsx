import { redirect } from "next/navigation";

import { getAppSession } from "@/lib/auth/session";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getAppSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const creds = getSupabasePublicEnv();

  return (
    <LoginForm
      supabaseUrl={creds?.url ?? null}
      supabaseKey={creds?.key ?? null}
      initialMessage={params.message}
    />
  );
}
