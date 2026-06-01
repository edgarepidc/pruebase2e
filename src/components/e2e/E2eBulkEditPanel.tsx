"use client";

import { useMemo, useState, useTransition } from "react";

import { bulkUpdateE2eDayAction } from "@/app/dashboard/actions";
import { E2E_ESTATUS_OPTIONS } from "@/lib/e2e/constants";
import type { E2ETask } from "@/lib/e2e/types";

type Props = {
  dayLabel: string;
  allDayTasks: E2ETask[];
  /** Pruebas del día (fechaInicio = dayDate). */
  scheduledTasks: E2ETask[];
};

export function E2eBulkEditPanel({
  dayLabel,
  allDayTasks,
  scheduledTasks,
}: Props) {
  const [includeArrastre, setIncludeArrastre] = useState(false);
  const [applyEstatus, setApplyEstatus] = useState(true);
  const [estatus, setEstatus] = useState("Completado");
  const [applyNuevaFecha, setApplyNuevaFecha] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [clearNuevaFecha, setClearNuevaFecha] = useState(false);
  const [applyComentarios, setApplyComentarios] = useState(false);
  const [comentarios, setComentarios] = useState("");
  const [appendComentarios, setAppendComentarios] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const targetTasks = useMemo(() => {
    if (includeArrastre) return allDayTasks;
    return scheduledTasks;
  }, [includeArrastre, allDayTasks, scheduledTasks]);

  const taskIds = targetTasks.map((t) => t.id).join(",");

  const submit = () => {
    setMessage(null);
    const fd = new FormData();
    fd.set("taskIds", taskIds);
    if (applyEstatus) {
      fd.set("applyEstatus", "on");
      fd.set("estatus", estatus);
    }
    if (applyNuevaFecha) {
      fd.set("applyNuevaFecha", "on");
      if (clearNuevaFecha) fd.set("clearNuevaFecha", "on");
      else if (nuevaFecha) fd.set("nuevaFecha", nuevaFecha);
    }
    if (applyComentarios && comentarios.trim()) {
      fd.set("applyComentarios", "on");
      fd.set("comentarios", comentarios.trim());
      if (appendComentarios) fd.set("appendComentarios", "on");
    }

    startTransition(async () => {
      try {
        const r = await bulkUpdateE2eDayAction(fd);
        setMessage(`Actualizadas ${r.count} pruebas.`);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Error al actualizar");
      }
    });
  };

  return (
    <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
      <h3 className="text-sm font-semibold text-indigo-950">
        Edición masiva · {dayLabel}
      </h3>
      <p className="mt-1 text-xs text-indigo-900/80">
        Aplica el mismo cambio a varias pruebas del día de una vez.
      </p>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeArrastre}
          onChange={(e) => setIncludeArrastre(e.target.checked)}
        />
        Incluir pruebas arrastradas de otros días ({allDayTasks.length - scheduledTasks.length})
      </label>

      <p className="mt-1 text-xs font-medium text-indigo-800">
        Se actualizarán {targetTasks.length} prueba(s)
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={applyEstatus}
              onChange={(e) => setApplyEstatus(e.target.checked)}
            />
            Estatus
          </label>
          <select
            value={estatus}
            disabled={!applyEstatus || pending}
            onChange={(e) => setEstatus(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          >
            {E2E_ESTATUS_OPTIONS.map((opt) => (
              <option key={opt || "pendiente"} value={opt}>
                {opt || "Pendiente"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={applyNuevaFecha}
              onChange={(e) => setApplyNuevaFecha(e.target.checked)}
            />
            Nueva fecha
          </label>
          <input
            type="date"
            value={nuevaFecha}
            disabled={!applyNuevaFecha || clearNuevaFecha || pending}
            onChange={(e) => setNuevaFecha(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={clearNuevaFecha}
              disabled={!applyNuevaFecha || pending}
              onChange={(e) => setClearNuevaFecha(e.target.checked)}
            />
            Limpiar nueva fecha
          </label>
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={applyComentarios}
              onChange={(e) => setApplyComentarios(e.target.checked)}
            />
            Comentarios
          </label>
          <textarea
            rows={2}
            value={comentarios}
            disabled={!applyComentarios || pending}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Texto para todas las filas seleccionadas…"
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={appendComentarios}
              disabled={!applyComentarios || pending}
              onChange={(e) => setAppendComentarios(e.target.checked)}
            />
            Agregar al final (no reemplazar)
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending || targetTasks.length === 0}
          onClick={submit}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "Aplicando…" : "Aplicar a selección"}
        </button>
        <button
          type="button"
          disabled={pending || scheduledTasks.length === 0}
          onClick={() => {
            setIncludeArrastre(false);
            setApplyEstatus(true);
            setEstatus("Completado");
            setApplyNuevaFecha(false);
            setApplyComentarios(false);
            const fd = new FormData();
            fd.set("taskIds", scheduledTasks.map((t) => t.id).join(","));
            fd.set("applyEstatus", "on");
            fd.set("estatus", "Completado");
            startTransition(async () => {
              try {
                const r = await bulkUpdateE2eDayAction(fd);
                setMessage(`Marcadas como completadas: ${r.count} pruebas del día.`);
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Error");
              }
            });
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
        >
          Completar todas del día ({scheduledTasks.length})
        </button>
      </div>

      {message ? <p className="mt-2 text-sm text-indigo-900">{message}</p> : null}
    </div>
  );
}
