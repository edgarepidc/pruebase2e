import { db } from "@/lib/db";
import { verifyE2ePublicPassword } from "@/lib/e2e/password";
import type { E2ETask } from "@/lib/e2e/types";

function rowToDto(row: {
  id: string;
  externalId: number;
  actividad: string;
  responsable: string;
  flujo: string;
  fechaInicio: string;
  nuevaFecha: string;
  estatus: string;
  comentarios: string;
  personaAsignada: string | null;
}): E2ETask {
  return {
    id: row.id,
    externalId: row.externalId,
    actividad: row.actividad,
    responsable: row.responsable,
    flujo: row.flujo,
    fechaInicio: row.fechaInicio,
    nuevaFecha: row.nuevaFecha,
    estatus: row.estatus,
    comentarios: row.comentarios,
    personaAsignada: row.personaAsignada,
  };
}

export async function listE2eTasksByTenant(tenantId: string): Promise<E2ETask[]> {
  const rows = await db.e2eQaTask.findMany({
    where: { tenantId },
    orderBy: [{ externalId: "asc" }],
  });
  return rows.map(rowToDto);
}

export async function updateE2eTask(input: {
  tenantId: string;
  id: string;
  estatus?: string;
  nuevaFecha?: string;
  comentarios?: string;
  personaAsignada?: string | null;
}): Promise<E2ETask> {
  const row = await db.e2eQaTask.update({
    where: { id: input.id, tenantId: input.tenantId },
    data: {
      ...(input.estatus !== undefined ? { estatus: input.estatus } : {}),
      ...(input.nuevaFecha !== undefined ? { nuevaFecha: input.nuevaFecha } : {}),
      ...(input.comentarios !== undefined ? { comentarios: input.comentarios } : {}),
      ...(input.personaAsignada !== undefined
        ? { personaAsignada: input.personaAsignada }
        : {}),
    },
  });
  return rowToDto(row);
}

export async function getTenantByE2ePublicToken(token: string) {
  return db.tenant.findFirst({
    where: { e2ePublicToken: token },
    select: {
      id: true,
      name: true,
      slug: true,
      e2ePublicToken: true,
      e2ePublicPasswordHash: true,
    },
  });
}

export async function getE2ePublicToken(tenantId: string): Promise<string | null> {
  const row = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { e2ePublicToken: true },
  });
  return row?.e2ePublicToken ?? null;
}

export async function getE2ePublicLinkInfo(
  tenantId: string,
): Promise<{ token: string | null; hasPassword: boolean }> {
  const row = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { e2ePublicToken: true, e2ePublicPasswordHash: true },
  });
  return {
    token: row?.e2ePublicToken ?? null,
    hasPassword: Boolean(row?.e2ePublicPasswordHash),
  };
}

export async function setE2ePublicToken(
  tenantId: string,
  token: string | null,
): Promise<string | null> {
  const row = await db.tenant.update({
    where: { id: tenantId },
    data: {
      e2ePublicToken: token,
      ...(token === null ? { e2ePublicPasswordHash: null } : {}),
    },
    select: { e2ePublicToken: true },
  });
  return row.e2ePublicToken;
}

export async function setE2ePublicPasswordHash(
  tenantId: string,
  hash: string | null,
): Promise<void> {
  await db.tenant.update({
    where: { id: tenantId },
    data: { e2ePublicPasswordHash: hash },
  });
}

export async function verifyTenantE2ePublicPassword(
  token: string,
  password: string,
): Promise<boolean> {
  const tenant = await getTenantByE2ePublicToken(token);
  if (!tenant?.e2ePublicToken) return false;
  if (!tenant.e2ePublicPasswordHash) return true;
  return verifyE2ePublicPassword(password, tenant.e2ePublicPasswordHash);
}

export async function bulkUpdateE2eTasks(input: {
  tenantId: string;
  taskIds: string[];
  estatus?: string;
  nuevaFecha?: string | null;
  clearNuevaFecha?: boolean;
  comentarios?: string;
  appendComentarios?: boolean;
}): Promise<number> {
  if (input.taskIds.length === 0) return 0;

  const data: {
    estatus?: string;
    nuevaFecha?: string;
    comentarios?: string;
  } = {};

  if (input.estatus !== undefined) data.estatus = input.estatus;
  if (input.clearNuevaFecha) data.nuevaFecha = "";
  else if (input.nuevaFecha !== undefined && input.nuevaFecha !== null) {
    data.nuevaFecha = input.nuevaFecha;
  }

  if (input.comentarios !== undefined && !input.appendComentarios) {
    data.comentarios = input.comentarios;
  }

  if (input.appendComentarios && input.comentarios !== undefined) {
    const existing = await db.e2eQaTask.findMany({
      where: { tenantId: input.tenantId, id: { in: input.taskIds } },
      select: { id: true, comentarios: true },
    });
    let count = 0;
    for (const row of existing) {
      const merged = row.comentarios?.trim()
        ? `${row.comentarios.trim()}\n${input.comentarios}`
        : input.comentarios;
      await db.e2eQaTask.update({
        where: { id: row.id, tenantId: input.tenantId },
        data: { ...data, comentarios: merged },
      });
      count += 1;
    }
    return count;
  }

  const result = await db.e2eQaTask.updateMany({
    where: { tenantId: input.tenantId, id: { in: input.taskIds } },
    data,
  });
  return result.count;
}

export async function upsertE2eTasksFromSeed(
  tenantId: string,
  tasks: Array<{
    id: number;
    actividad: string;
    responsable: string;
    flujo: string;
    fechaInicio: string;
    nuevaFecha?: string;
    estatus?: string;
    comentarios?: string;
    personaAsignada?: string;
  }>,
): Promise<number> {
  let count = 0;
  for (const t of tasks) {
    await db.e2eQaTask.upsert({
      where: {
        tenantId_externalId: { tenantId, externalId: t.id },
      },
      create: {
        tenantId,
        externalId: t.id,
        actividad: t.actividad,
        responsable: t.responsable,
        flujo: t.flujo,
        fechaInicio: t.fechaInicio,
        nuevaFecha: t.nuevaFecha ?? "",
        estatus: t.estatus ?? "",
        comentarios: t.comentarios ?? "",
        personaAsignada: t.personaAsignada ?? null,
      },
      update: {
        actividad: t.actividad,
        responsable: t.responsable,
        flujo: t.flujo,
        fechaInicio: t.fechaInicio,
        nuevaFecha: t.nuevaFecha ?? "",
        estatus: t.estatus ?? "",
        comentarios: t.comentarios ?? "",
        personaAsignada: t.personaAsignada ?? null,
      },
    });
    count += 1;
  }
  return count;
}
