import type { E2ETask } from "./types";

function escapeCsvCell(value: string): string {
  const s = value.replace(/"/g, '""');
  if (/[",\n\r]/.test(s)) return `"${s}"`;
  return s;
}

/** CSV con BOM UTF-8 para que Excel abra acentos correctamente. */
export function tasksToCsv(tasks: E2ETask[]): string {
  const headers = [
    "ID",
    "Actividad",
    "Responsable",
    "Flujo",
    "Fecha inicio",
    "Nueva fecha",
    "Estatus",
    "Persona asignada",
    "Comentarios",
  ];
  const rows = tasks.map((t) =>
    [
      String(t.externalId),
      t.actividad,
      t.responsable,
      t.flujo,
      t.fechaInicio,
      t.nuevaFecha,
      t.estatus || "Pendiente",
      t.personaAsignada ?? "",
      t.comentarios,
    ]
      .map(escapeCsvCell)
      .join(","),
  );
  return `\uFEFF${headers.join(",")}\n${rows.join("\n")}`;
}

export function downloadTasksCsv(tasks: E2ETask[], filename: string) {
  const csv = tasksToCsv(tasks);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
