import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { E2ePublicPasswordGate } from "@/components/e2e/E2ePublicPasswordGate";
import { TableroE2E } from "@/components/e2e/TableroE2E";
import {
  E2E_PUBLIC_UNLOCK_COOKIE,
  verifyPublicUnlockCookieValue,
} from "@/lib/e2e/public-cookie";
import {
  getTenantByE2ePublicToken,
  listE2eTasksByTenant,
} from "@/modules/e2e/service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function PublicE2EPage({ params }: PageProps) {
  const { token: rawToken } = await params;
  const token = rawToken.trim();
  const tenant = await getTenantByE2ePublicToken(token);
  if (!tenant?.e2ePublicToken) notFound();

  const requiresPassword = Boolean(tenant.e2ePublicPasswordHash);
  const cookieStore = await cookies();
  const unlocked =
    !requiresPassword ||
    verifyPublicUnlockCookieValue(
      token,
      cookieStore.get(E2E_PUBLIC_UNLOCK_COOKIE)?.value,
    );

  if (!unlocked) {
    return <E2ePublicPasswordGate token={token} tenantName={tenant.name} />;
  }

  const tasks = await listE2eTasksByTenant(tenant.id);

  return (
    <div className="min-h-screen bg-[#f8f9fb] px-4 py-8">
      <main className="mx-auto max-w-[1600px]">
        <TableroE2E
          tasks={tasks}
          canEdit={false}
          publicMode
          tenantName={tenant.name}
        />
      </main>
    </div>
  );
}
