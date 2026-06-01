import * as XLSX from "xlsx";

import type { E2ETask } from "./types";

const HEADERS = [
  "ID",
  "Actividad",
  "Responsable",
  "Flujo",
  "Fecha inicio",
  "Nueva fecha",
  "Estatus",
  "Persona asignada",
  "Comentarios",
] as const;

function taskToRow(t: E2ETask): string[] {
  return [
    String(t.externalId),
    t.actividad,
    t.responsable,
    t.flujo,
    t.fechaInicio,
    t.nuevaFecha,
    t.estatus || "Pendiente",
    t.personaAsignada ?? "",
    t.comentarios,
  ];
}

export function tasksToXlsxArrayBuffer(tasks: E2ETask[]): ArrayBuffer {
  const data = [HEADERS.slice(), ...tasks.map(taskToRow)];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tablero E2E");
  return XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

export function downloadTasksXlsx(tasks: E2ETask[], filename: string) {
  const buf = tasksToXlsxArrayBuffer(tasks);
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
