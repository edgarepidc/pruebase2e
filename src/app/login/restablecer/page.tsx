import Link from "next/link";

import { getSupabasePublicEnv } from "@/utils/supabase/env";

import { RestablecerForm } from "./restablecer-form";

export const dynamic = "force-dynamic";

export default function RestablecerPage() {
  const creds = getSupabasePublicEnv();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Elige una contraseña nueva y luego vuelve a iniciar sesión.
        </p>
        <div className="mt-6">
          <RestablecerForm
            supabaseUrl={creds?.url ?? null}
            supabaseKey={creds?.key ?? null}
          />
        </div>
        <Link
          className="mt-6 inline-block text-sm text-indigo-600 hover:underline"
          href="/login"
        >
          Volver al login
        </Link>
      </div>
    </main>
  );
}
