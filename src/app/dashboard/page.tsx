import { redirect } from "next/navigation";

import { TableroE2E } from "@/components/e2e/TableroE2E";
import { getAppSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/env";
import { buildPublicE2eUrl } from "@/lib/e2e/public-token";
import { getDefaultTenant } from "@/lib/tenant";
import {
  getE2ePublicLinkInfo,
  listE2eTasksByTenant,
} from "@/modules/e2e/service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAppSession();
  if (!session) redirect("/login");

  const tenant = await getDefaultTenant();
  const [tasks, linkInfo] = await Promise.all([
    listE2eTasksByTenant(tenant.id),
    getE2ePublicLinkInfo(tenant.id),
  ]);

  const { value: origin } = getAppUrl();
  const publicUrl = linkInfo.token
    ? buildPublicE2eUrl(origin, linkInfo.token)
    : null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] px-4 py-8">
      <main className="mx-auto max-w-[1600px]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Tablero E2E QA</h1>
            <p className="text-sm text-zinc-600">{tenant.name}</p>
          </div>
          <p className="text-xs text-zinc-500">{session.email}</p>
        </header>

        {tasks.length === 0 ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">Sin datos de pruebas</p>
            <p className="mt-1">
              Ejecuta{" "}
              <code className="rounded bg-amber-100/80 px-1">npm run prisma:seed</code>{" "}
              contra tu base de Supabase.
            </p>
          </div>
        ) : null}

        <TableroE2E
          tasks={tasks}
          canEdit={session.canEdit}
          publicUrl={publicUrl}
          publicLinkHasPassword={linkInfo.hasPassword}
        />
      </main>
    </div>
  );
}
