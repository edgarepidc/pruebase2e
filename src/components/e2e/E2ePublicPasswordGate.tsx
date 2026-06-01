"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { verifyE2ePublicPasswordAction } from "@/app/public/e2e/[token]/actions";

type Props = {
  token: string;
  tenantName: string;
};

export function E2ePublicPasswordGate({ token, tenantName }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyE2ePublicPasswordAction(token, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-zinc-900">Tablero E2E QA</h1>
        <p className="mt-1 text-sm text-zinc-600">{tenantName}</p>
        <p className="mt-4 text-sm text-zinc-700">
          Este enlace está protegido con contraseña. Ingrésala para ver el tablero.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="e2e-public-password"
              className="block text-sm font-medium text-zinc-700"
            >
              Contraseña
            </label>
            <input
              id="e2e-public-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={pending || !password.trim()}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "Verificando…" : "Acceder al tablero"}
          </button>
        </form>
      </div>
    </div>
  );
}
