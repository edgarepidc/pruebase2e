import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new PrismaClient();

const tenantName = process.env.TENANT_NAME?.trim() || "EMBUS ADO";
const tenantSlug = process.env.TENANT_SLUG?.trim() || "embus";

async function main() {
  const tenant = await db.tenant.upsert({
    where: { slug: tenantSlug },
    update: { name: tenantName },
    create: { id: randomUUID(), name: tenantName, slug: tenantSlug },
  });

  const raw = readFileSync(
    join(__dirname, "data/e2e-tasks-seed.json"),
    "utf8",
  );
  const tasks = JSON.parse(raw);

  let count = 0;
  for (const t of tasks) {
    await db.e2eQaTask.upsert({
      where: {
        tenantId_externalId: { tenantId: tenant.id, externalId: t.id },
      },
      create: {
        tenantId: tenant.id,
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

  console.log(`Tenant: ${tenant.name} (${tenant.id})`);
  console.log(`Pruebas E2E cargadas: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
