import { db } from "@/lib/db";

const DEFAULT_SLUG = process.env.DEFAULT_TENANT_SLUG?.trim() || "embus";

/** Workspace único del despliegue (primer tenant o slug por defecto). */
export async function getDefaultTenant() {
  const bySlug = await db.tenant.findUnique({ where: { slug: DEFAULT_SLUG } });
  if (bySlug) return bySlug;
  const first = await db.tenant.findFirst({ orderBy: { createdAt: "asc" } });
  if (!first) {
    throw new Error(
      "No hay workspace. Ejecuta: npm run prisma:seed (con DATABASE_URL configurada).",
    );
  }
  return first;
}
