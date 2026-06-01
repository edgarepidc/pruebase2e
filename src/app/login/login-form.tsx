"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useMemo, useState } from "react";

import { supabaseAuthCookieOptions } from "@/utils/supabase/cookie-options";

type Props = {
  supabaseUrl: string | null;
  supabaseKey: string | null;
};

export function LoginForm({ supabaseUrl, supabaseKey }: Props) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const envOk = !!(supabaseUrl && supabaseKey);
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseKey) return null;
    return createBrowserClient(supabaseUrl, supabaseKey, {
      cookieOptions: supabaseAuthCookieOptions(),
    });
  }, [supabaseUrl, supabaseKey]);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!supabase) return;
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);
    if (err) {
      setError(err.message);
      return;
    }
    window.location.assign("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Tablero E2E QA</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Inicia sesión para editar el tablero. La vista pública no requiere cuenta.
        </p>

        {!envOk ? (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
            en Vercel.
          </p>
        ) : null}

        <form onSubmit={handleSignIn} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={!envOk || pending}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "Entrando…" : "Entrar al tablero"}
          </button>
        </form>
      </div>
    </main>
  );
}
