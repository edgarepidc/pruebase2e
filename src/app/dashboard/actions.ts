"use server";

import { revalidatePath } from "next/cache";

import { canEditEmail, requireAppSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/env";
import { hashE2ePublicPassword } from "@/lib/e2e/password";
import { buildPublicE2eUrl, generateE2ePublicToken } from "@/lib/e2e/public-token";
import { getDefaultTenant } from "@/lib/tenant";
import {
  bulkUpdateE2eTasks,
  getE2ePublicLinkInfo,
  getE2ePublicToken,
  setE2ePublicPasswordHash,
  setE2ePublicToken,
  updateE2eTask,
} from "@/modules/e2e/service";

function revalidateE2ePaths(publicToken?: string | null) {
  revalidatePath("/dashboard");
  if (publicToken) {
    revalidatePath(`/public/e2e/${publicToken}`);
  }
}

async function tenantIdForEditor() {
  const session = await requireAppSession();
  if (!canEditEmail(session.email)) {
    throw new Error("Tu cuenta no tiene permiso de edición en este tablero.");
  }
  const tenant = await getDefaultTenant();
  return { tenantId: tenant.id, session };
}

export async function updateE2eTaskAction(formData: FormData) {
  const { tenantId } = await tenantIdForEditor();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Tarea inválida");

  await updateE2eTask({
    tenantId,
    id,
    estatus: String(formData.get("estatus") ?? ""),
    nuevaFecha: String(formData.get("nuevaFecha") ?? ""),
    comentarios: String(formData.get("comentarios") ?? ""),
    personaAsignada:
      String(formData.get("personaAsignada") ?? "").trim() || null,
  });

  const token = await getE2ePublicToken(tenantId);
  revalidateE2ePaths(token);
}

export async function bulkUpdateE2eDayAction(formData: FormData) {
  const { tenantId } = await tenantIdForEditor();

  const rawIds = String(formData.get("taskIds") ?? "");
  const taskIds = rawIds
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (taskIds.length === 0) throw new Error("Selecciona al menos una prueba");

  const estatus = String(formData.get("estatus") ?? "");
  const applyEstatus = formData.get("applyEstatus") === "on";
  const nuevaFecha = String(formData.get("nuevaFecha") ?? "");
  const applyNuevaFecha = formData.get("applyNuevaFecha") === "on";
  const clearNuevaFecha = formData.get("clearNuevaFecha") === "on";
  const comentarios = String(formData.get("comentarios") ?? "");
  const applyComentarios = formData.get("applyComentarios") === "on";
  const appendComentarios = formData.get("appendComentarios") === "on";

  if (!applyEstatus && !applyNuevaFecha && !applyComentarios) {
    throw new Error("Marca al menos un campo a actualizar");
  }

  const count = await bulkUpdateE2eTasks({
    tenantId,
    taskIds,
    ...(applyEstatus ? { estatus } : {}),
    ...(applyNuevaFecha && clearNuevaFecha ? { clearNuevaFecha: true } : {}),
    ...(applyNuevaFecha && !clearNuevaFecha && nuevaFecha
      ? { nuevaFecha }
      : {}),
    ...(applyComentarios ? { comentarios, appendComentarios } : {}),
  });

  const token = await getE2ePublicToken(tenantId);
  revalidateE2ePaths(token);

  return { ok: true, count };
}

export async function generateE2ePublicLinkAction(password?: string): Promise<{
  url: string;
  token: string;
  hasPassword: boolean;
}> {
  const { tenantId } = await tenantIdForEditor();

  const token = generateE2ePublicToken();
  await setE2ePublicToken(tenantId, token);

  const trimmed = password?.trim();
  if (trimmed) {
    const hash = await hashE2ePublicPassword(trimmed);
    await setE2ePublicPasswordHash(tenantId, hash);
  }

  const { value: origin } = getAppUrl();
  const url = buildPublicE2eUrl(origin, token);
  revalidateE2ePaths(token);
  return { url, token, hasPassword: Boolean(trimmed) };
}

export async function setE2ePublicPasswordAction(
  password: string | null,
): Promise<{ hasPassword: boolean }> {
  const { tenantId } = await tenantIdForEditor();

  const { token } = await getE2ePublicLinkInfo(tenantId);
  if (!token) throw new Error("Genera un enlace público primero");

  const trimmed = password?.trim();
  if (trimmed) {
    const hash = await hashE2ePublicPassword(trimmed);
    await setE2ePublicPasswordHash(tenantId, hash);
  } else {
    await setE2ePublicPasswordHash(tenantId, null);
  }

  revalidateE2ePaths(token);
  return { hasPassword: Boolean(trimmed) };
}

export async function revokeE2ePublicLinkAction(): Promise<void> {
  const { tenantId } = await tenantIdForEditor();

  const prev = await getE2ePublicToken(tenantId);
  await setE2ePublicToken(tenantId, null);
  revalidateE2ePaths(prev);
}
