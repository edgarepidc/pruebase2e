"use client";

import { useState, useTransition } from "react";

import {
  generateE2ePublicLinkAction,
  revokeE2ePublicLinkAction,
  setE2ePublicPasswordAction,
} from "@/app/dashboard/actions";

type Props = {
  publicUrl: string | null;
  hasPassword?: boolean;
};

export function E2ePublicLinkPanel({
  publicUrl,
  hasPassword: initialHasPassword = false,
}: Props) {
  const [url, setUrl] = useState(publicUrl);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [newLinkPassword, setNewLinkPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSetPassword = (clear: boolean) => {
    startTransition(async () => {
      setError(null);
      setPasswordMsg(null);
      try {
        const r = await setE2ePublicPasswordAction(
          clear ? null : passwordInput,
        );
        setHasPassword(r.hasPassword);
        if (clear) {
          setPasswordInput("");
          setPasswordMsg("Contraseña quitada del enlace.");
        } else {
          setPasswordInput("");
          setPasswordMsg("Contraseña actualizada.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4">
      <h3 className="text-sm font-semibold text-zinc-900">
        Enlace público (solo lectura)
      </h3>
      <p className="mt-1 text-xs text-zinc-600">
        Comparte el tablero con clientes o QA sin cuenta. No permiten editar
        datos. Opcionalmente protege el enlace con contraseña.
      </p>

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      {passwordMsg ? (
        <p className="mt-2 text-sm text-emerald-800">{passwordMsg}</p>
      ) : null}

      {url ? (
        <div className="mt-3 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              readOnly
              value={url}
              className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs"
            />
            <div className="flex shrink-0 flex-wrap gap-2">
              {hasPassword ? (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                  🔒 Con contraseña
                </span>
              ) : null}
              <button
                type="button"
                disabled={pending}
                onClick={() => void copy()}
                className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-900"
              >
                {copied ? "Copiado" : "Copiar"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    try {
                      const r = await generateE2ePublicLinkAction();
                      setUrl(r.url);
                      setHasPassword(r.hasPassword);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Error");
                    }
                  })
                }
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
              >
                Regenerar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    try {
                      await revokeE2ePublicLinkAction();
                      setUrl(null);
                      setHasPassword(false);
                      setNewLinkPassword("");
                      setPasswordInput("");
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Error");
                    }
                  })
                }
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 hover:bg-red-100"
              >
                Revocar
              </button>
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 bg-white p-3">
            <p className="text-xs font-medium text-zinc-700">
              Contraseña del enlace
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <input
                type="password"
                placeholder={
                  hasPassword
                    ? "Nueva contraseña (dejar vacío y quitar)"
                    : "Definir contraseña"
                }
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                autoComplete="new-password"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending || !passwordInput.trim()}
                  onClick={() => runSetPassword(false)}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {hasPassword ? "Cambiar" : "Activar"}
                </button>
                {hasPassword ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runSetPassword(true)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
                  >
                    Quitar
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-medium text-zinc-700">
            Contraseña al generar (opcional)
          </label>
          <input
            type="password"
            value={newLinkPassword}
            onChange={(e) => setNewLinkPassword(e.target.value)}
            placeholder="Opcional"
            className="w-full max-w-sm rounded-md border border-zinc-300 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  const r = await generateE2ePublicLinkAction(
                    newLinkPassword.trim() || undefined,
                  );
                  setUrl(r.url);
                  setHasPassword(r.hasPassword);
                  setNewLinkPassword("");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Error");
                }
              })
            }
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Generar enlace público
          </button>
        </div>
      )}
    </div>
  );
}
