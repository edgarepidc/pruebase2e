"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  buildPublicUnlockCookieValue,
  E2E_PUBLIC_UNLOCK_COOKIE,
  publicUnlockCookieOptions,
} from "@/lib/e2e/public-cookie";
import { verifyTenantE2ePublicPassword } from "@/modules/e2e/service";

export async function verifyE2ePublicPasswordAction(
  token: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "Enlace inválido" };

  const valid = await verifyTenantE2ePublicPassword(trimmed, password);
  if (!valid) return { ok: false, error: "Contraseña incorrecta" };

  const cookieStore = await cookies();
  cookieStore.set(
    E2E_PUBLIC_UNLOCK_COOKIE,
    buildPublicUnlockCookieValue(trimmed),
    publicUnlockCookieOptions(),
  );

  revalidatePath(`/public/e2e/${trimmed}`);
  return { ok: true };
}
