"use client";

import { useTransition } from "react";

import { updateE2eTaskAction } from "@/app/dashboard/actions";
import { E2E_ESTATUS_OPTIONS } from "@/lib/e2e/constants";
import type { E2ETask } from "@/lib/e2e/types";

import { TaskStatusChip } from "./TaskStatusChip";

type Props = {
  tasks: E2ETask[];
  canEdit: boolean;
  showOrigen?: boolean;
  daysByDate: Record<string, string>;
};

export function E2eTasksTable({
  tasks,
  canEdit,
  showOrigen = false,
  daysByDate,
}: Props) {
  const [pending, startTransition] = useTransition();

  if (tasks.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500">
        No hay pruebas en esta vista.
      </p>
    );
  }

  return (
    <div className="e2e-table-wrap">
      <table className="e2e-table">
        <thead>
          <tr>
            <th>#</th>
            {showOrigen ? <th>Origen</th> : null}
            <th>Actividad</th>
            <th>Flujo</th>
            <th>Resp.</th>
            <th>Estatus</th>
            <th>Nueva fecha</th>
            <th>Comentarios</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="font-mono text-xs text-zinc-500">{task.externalId}</td>
              {showOrigen ? (
                <td className="text-xs text-zinc-600">
                  {daysByDate[task.fechaInicio] ?? task.fechaInicio}
                </td>
              ) : null}
              <td className="max-w-md">{task.actividad}</td>
              <td className="text-xs text-zinc-500">{task.flujo}</td>
              <td className="text-xs">{task.responsable}</td>
              <td>
                {canEdit ? (
                  <select
                    name="estatus"
                    defaultValue={task.estatus}
                    disabled={pending}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                    onChange={(e) => {
                      const fd = new FormData();
                      fd.set("id", task.id);
                      fd.set("estatus", e.target.value);
                      fd.set("nuevaFecha", task.nuevaFecha);
                      fd.set("comentarios", task.comentarios);
                      fd.set("personaAsignada", task.personaAsignada ?? "");
                      startTransition(() => updateE2eTaskAction(fd));
                    }}
                  >
                    {E2E_ESTATUS_OPTIONS.map((opt) => (
                      <option key={opt || "pendiente"} value={opt}>
                        {opt || "Pendiente"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TaskStatusChip task={task} />
                )}
              </td>
              <td>
                {canEdit ? (
                  <input
                    type="date"
                    defaultValue={task.nuevaFecha || ""}
                    disabled={pending}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                    onBlur={(e) => {
                      if (e.target.value === (task.nuevaFecha || "")) return;
                      const fd = new FormData();
                      fd.set("id", task.id);
                      fd.set("estatus", task.estatus);
                      fd.set("nuevaFecha", e.target.value);
                      fd.set("comentarios", task.comentarios);
                      fd.set("personaAsignada", task.personaAsignada ?? "");
                      startTransition(() => updateE2eTaskAction(fd));
                    }}
                  />
                ) : (
                  <span className="font-mono text-xs text-zinc-500">
                    {task.nuevaFecha || "—"}
                  </span>
                )}
              </td>
              <td className="max-w-xs">
                {canEdit ? (
                  <input
                    type="text"
                    defaultValue={task.comentarios}
                    disabled={pending}
                    placeholder="Comentarios…"
                    className="w-full min-w-[140px] rounded border border-zinc-300 px-2 py-1 text-xs"
                    onBlur={(e) => {
                      if (e.target.value === task.comentarios) return;
                      const fd = new FormData();
                      fd.set("id", task.id);
                      fd.set("estatus", task.estatus);
                      fd.set("nuevaFecha", task.nuevaFecha);
                      fd.set("comentarios", e.target.value);
                      fd.set("personaAsignada", task.personaAsignada ?? "");
                      startTransition(() => updateE2eTaskAction(fd));
                    }}
                  />
                ) : (
                  <span className="text-xs text-zinc-600">{task.comentarios || "—"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
