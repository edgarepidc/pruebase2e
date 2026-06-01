import { getAppUrl } from "@/lib/env";

/** URL absoluta HTTPS de la app para redirectTo de Supabase Auth (recovery, magic link). */
export function getPasswordRecoveryRedirectTo(): string {
  const { value: origin } = getAppUrl();
  const base = origin.replace(/\/$/, "");
  if (/\.supabase\.co$/i.test(new URL(base).hostname)) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL no puede ser *.supabase.co. Usa https://pruebase2e.vercel.app en Vercel.",
    );
  }
  return `${base}/login/restablecer`;
}
