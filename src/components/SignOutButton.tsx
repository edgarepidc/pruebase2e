"use client";

import { useTransition } from "react";

import { signOutAction } from "@/app/dashboard/sign-out";

type Props = {
  className?: string;
};

export function SignOutButton({ className }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
      className={
        className ??
        "rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      }
    >
      {pending ? "Cerrando…" : "Cerrar sesión"}
    </button>
  );
}
