-- Tablero E2E QA (proyecto standalone pruebase2e)
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "e2ePublicToken" TEXT,
    "e2ePublicPasswordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "Tenant_e2ePublicToken_key" ON "Tenant"("e2ePublicToken");

CREATE TABLE "E2eQaTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "actividad" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "flujo" TEXT NOT NULL,
    "fechaInicio" TEXT NOT NULL,
    "nuevaFecha" TEXT NOT NULL DEFAULT '',
    "estatus" TEXT NOT NULL DEFAULT '',
    "comentarios" TEXT NOT NULL DEFAULT '',
    "personaAsignada" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "E2eQaTask_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "E2eQaTask_tenantId_externalId_key" ON "E2eQaTask"("tenantId", "externalId");
CREATE INDEX "E2eQaTask_tenantId_fechaInicio_idx" ON "E2eQaTask"("tenantId", "fechaInicio");
CREATE INDEX "E2eQaTask_tenantId_estatus_idx" ON "E2eQaTask"("tenantId", "estatus");

ALTER TABLE "E2eQaTask" ADD CONSTRAINT "E2eQaTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
