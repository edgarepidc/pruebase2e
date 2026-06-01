import Link from "next/link";
import { redirect } from "next/navigation";

import { getPasswordRecoveryRedirectTo } from "@/lib/auth/redirect-to";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function OlvidoContrasenaPage({ searchParams }: PageProps) {
  const params = await searchParams;

  async function requestResetAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    if (!email) {
      redirect("/login/olvido?error=Ingresa+un+correo+valido.");
    }

    const supabase = await createClient();
    let redirectTo: string;
    try {
      redirectTo = getPasswordRecoveryRedirectTo();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "URL de la app mal configurada.";
      redirect(`/login/olvido?error=${encodeURIComponent(msg)}`);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      const lower = error.message.toLowerCase();
      const friendly = lower.includes("requested path is invalid")
        ? "Supabase rechazó la URL de retorno. En Authentication → URL Configuration agrega https://pruebase2e.vercel.app/login/restablecer y https://pruebase2e.vercel.app/** (Site URL = https://pruebase2e.vercel.app). Luego redeploy."
        : error.message;
      redirect(`/login/olvido?error=${encodeURIComponent(friendly)}`);
    }

    redirect(
      `/login/olvido?message=${encodeURIComponent(
        "Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.",
      )}`,
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Te enviaremos un enlace por correo. Revisa también spam.
        </p>

        {params.error ? (
          <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
            {params.error}
          </p>
        ) : null}
        {params.message ? (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800">
            {params.message}
          </p>
        ) : null}

        <form action={requestResetAction} className="mt-6 space-y-3">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="email@empresa.com"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Enviar enlace
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}
