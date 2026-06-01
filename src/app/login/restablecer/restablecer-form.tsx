"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { supabaseAuthCookieOptions } from "@/utils/supabase/cookie-options";

type Props = {
  supabaseUrl: string | null;
  supabaseKey: string | null;
};

type Phase = "loading" | "no-session" | "ready";

export function RestablecerForm({ supabaseUrl, supabaseKey }: Props) {
  const [phase, setPhase] = useState<Phase>(() =>
    supabaseUrl && supabaseKey ? "loading" : "no-session",
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const envOk = !!(supabaseUrl && supabaseKey);
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseKey) return null;
    return createBrowserClient(supabaseUrl, supabaseKey, {
      cookieOptions: supabaseAuthCookieOptions(),
    });
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let cancelled = false;

    async function init() {
      setError("");
      const hash =
        typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      if (hash.includes("access_token")) {
        await client.auth.getSession();
        window.history.replaceState(null, "", window.location.pathname);
      }

      const code = new URL(window.location.href).searchParams.get("code");
      if (code) {
        const { error: exchangeError } =
          await client.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) {
            setError(exchangeError.message);
            setPhase("no-session");
          }
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
      }

      const {
        data: { session },
      } = await client.auth.getSession();
      if (!cancelled) setPhase(session ? "ready" : "no-session");
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSubmit(formData: FormData) {
    setError("");
    if (!supabase) return;
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setPending(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      await supabase.auth.signOut();
      window.location.assign(
        `/login?message=${encodeURIComponent(
          "Contraseña actualizada. Inicia sesión con la nueva contraseña.",
        )}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
    } finally {
      setPending(false);
    }
  }

  if (!envOk) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">
        Falta configuración de Supabase en el servidor.
      </p>
    );
  }

  if (phase === "loading") {
    return <p className="text-sm text-zinc-600">Comprobando enlace…</p>;
  }

  if (phase === "no-session") {
    return (
      <div className="space-y-3">
        {error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        <p className="text-sm text-zinc-600">
          El enlace expiró o ya se usó. Solicita uno nuevo.
        </p>
        <Link href="/login/olvido" className="text-sm font-medium text-indigo-600 underline">
          Recuperar contraseña
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(new FormData(e.currentTarget));
      }}
    >
      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <input
        name="password"
        type="password"
        required
        minLength={8}
        disabled={pending}
        autoComplete="new-password"
        placeholder="Nueva contraseña (mín. 8 caracteres)"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="confirm"
        type="password"
        required
        minLength={8}
        disabled={pending}
        autoComplete="new-password"
        placeholder="Repite la contraseña"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
