"use client";

import { useMemo, useState } from "react";

import { E2E_DAYS, E2E_SPRINT_META } from "@/lib/e2e/constants";
import type { E2ETask } from "@/lib/e2e/types";

import "./e2e-board.css";
import { E2eBulkEditPanel } from "./E2eBulkEditPanel";
import { E2eExportButton } from "./E2eExportButton";
import { E2ePublicLinkPanel } from "./E2ePublicLinkPanel";
import { E2eTasksTable } from "./E2eTasksTable";
import { ResumenGeneral } from "./ResumenGeneral";

type TabId =
  | "resumen"
  | "dia1"
  | "dia2"
  | "dia3"
  | "dia4"
  | "dia5"
  | "atrasados"
  | "remediacion";

type Props = {
  tasks: E2ETask[];
  canEdit: boolean;
  /** Vista pública sin login. */
  publicMode?: boolean;
  /** URL pública existente (panel de administración). */
  publicUrl?: string | null;
  publicLinkHasPassword?: boolean;
  tenantName?: string;
};

export function TableroE2E({
  tasks,
  canEdit,
  publicMode = false,
  publicUrl = null,
  publicLinkHasPassword = false,
  tenantName,
}: Props) {
  const [tab, setTab] = useState<TabId>("resumen");

  const daysByDate = useMemo(
    () => Object.fromEntries(E2E_DAYS.map((d) => [d.date, d.nombre])),
    [],
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: "resumen", label: "📊 Resumen general" },
    ...E2E_DAYS.map((d) => ({
      id: d.key as TabId,
      label: `${d.label} · ${d.short}`,
    })),
    { id: "atrasados", label: "🔴 Atrasados" },
    { id: "remediacion", label: "🛠 En remediación" },
  ];

  const dayMeta = E2E_DAYS.find((d) => d.key === tab);

  const scheduledForDay = dayMeta
    ? tasks.filter((t) => t.fechaInicio === dayMeta.date)
    : [];

  const dayTasks = dayMeta
    ? [
        ...scheduledForDay,
        ...tasks.filter(
          (t) =>
            t.fechaInicio !== dayMeta.date &&
            (t.estatus === "ATRASADO" ||
              t.estatus === "REMEDIACION" ||
              t.estatus === "Remediación" ||
              !t.estatus?.trim()),
        ),
      ]
    : [];

  const atrasados = tasks.filter((t) => t.estatus === "ATRASADO");
  const remediacion = tasks.filter(
    (t) => t.estatus === "REMEDIACION" || t.estatus === "Remediación",
  );

  const exportTasks =
    tab === "resumen"
      ? tasks
      : tab === "atrasados"
        ? atrasados
        : tab === "remediacion"
          ? remediacion
          : dayMeta
            ? dayTasks
            : tasks;

  const exportLabel = tabs.find((t) => t.id === tab)?.label ?? "tablero";

  return (
    <div className="e2e-shell space-y-0">
      <header className="e2e-header">
        <div className="flex items-center gap-4">
          <span className="e2e-logo">ADO · E2E</span>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">{E2E_SPRINT_META.title}</h1>
            <p className="text-xs text-zinc-500">
              {publicMode && tenantName
                ? `${tenantName} · vista pública`
                : E2E_SPRINT_META.subtitle}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <E2eExportButton tasks={exportTasks} viewLabel={exportLabel} />
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-xs text-zinc-600">
            {E2E_SPRINT_META.weekLabel}
          </span>
          {publicMode ? (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              Solo lectura
            </span>
          ) : (
            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              ● En curso
            </span>
          )}
        </div>
      </header>

      {publicMode ? (
        <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          Vista pública de solo lectura. Los cambios deben hacerse desde el dashboard con sesión
          iniciada.
        </p>
      ) : canEdit ? (
        <p className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
          Modo edición: cambia campos en la tabla, usa edición masiva por día o exporta a Excel.
        </p>
      ) : (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Solo lectura. Tu email no está en ALLOWED_EDIT_EMAILS (si está configurado en el servidor).
        </p>
      )}

      {canEdit && !publicMode ? (
        <div className="mt-3">
          <E2ePublicLinkPanel
            publicUrl={publicUrl}
            hasPassword={publicLinkHasPassword}
          />
        </div>
      ) : null}

      <nav className="e2e-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`e2e-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="e2e-panel">
        {tab === "resumen" && (
          <ResumenGeneral tasks={tasks} onSelectDay={(key) => setTab(key as TabId)} />
        )}

        {dayMeta && tab !== "resumen" && tab !== "atrasados" && tab !== "remediacion" && (
          <>
            <h2 className="mb-1 text-base font-bold">{dayMeta.nombre}</h2>
            <p className="mb-4 text-sm text-zinc-500">
              {scheduledForDay.length} pruebas del día
              {dayTasks.length > scheduledForDay.length
                ? " · incluye arrastre de días anteriores"
                : ""}
            </p>

            {canEdit && !publicMode ? (
              <E2eBulkEditPanel
                dayLabel={dayMeta.label}
                scheduledTasks={scheduledForDay}
                allDayTasks={dayTasks}
              />
            ) : null}

            <E2eTasksTable
              tasks={dayTasks}
              canEdit={canEdit && !publicMode}
              showOrigen
              daysByDate={daysByDate}
            />
          </>
        )}

        {tab === "atrasados" && (
          <>
            <h2 className="mb-4 text-base font-bold">Tareas atrasadas</h2>
            <E2eTasksTable
              tasks={atrasados}
              canEdit={canEdit && !publicMode}
              showOrigen
              daysByDate={daysByDate}
            />
          </>
        )}

        {tab === "remediacion" && (
          <>
            <h2 className="mb-4 text-base font-bold">En remediación</h2>
            <E2eTasksTable
              tasks={remediacion}
              canEdit={canEdit && !publicMode}
              showOrigen
              daysByDate={daysByDate}
            />
          </>
        )}
      </div>
    </div>
  );
}
