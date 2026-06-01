import type { E2ETask, E2ETaskKPI } from "./types";

export type DelayLevel =
  | "completado"
  | "atrasado1"
  | "atrasado2"
  | "remediacion"
  | "pendiente";

export function getDelayLevel(task: E2ETask): DelayLevel {
  if (task.estatus === "Completado") return "completado";
  if (task.estatus === "REMEDIACION" || task.estatus === "Remediación") {
    return "remediacion";
  }
  if (!task.estatus?.trim()) return "pendiente";
  if (task.estatus === "ATRASADO") {
    if (task.nuevaFecha?.trim()) {
      const orig = new Date(task.fechaInicio);
      const nueva = new Date(task.nuevaFecha);
      const diff = Math.round((nueva.getTime() - orig.getTime()) / 86400000);
      return diff >= 2 ? "atrasado2" : "atrasado1";
    }
    return "atrasado1";
  }
  return "pendiente";
}

export function statsForTasks(tasks: E2ETask[]): E2ETaskKPI {
  return {
    total: tasks.length,
    completado: tasks.filter((t) => getDelayLevel(t) === "completado").length,
    atrasado1: tasks.filter((t) => getDelayLevel(t) === "atrasado1").length,
    atrasado2: tasks.filter((t) => getDelayLevel(t) === "atrasado2").length,
    remediacion: tasks.filter((t) => getDelayLevel(t) === "remediacion").length,
    pendiente: tasks.filter((t) => getDelayLevel(t) === "pendiente").length,
  };
}

export function delayLevelLabel(level: DelayLevel): string {
  const map: Record<DelayLevel, string> = {
    completado: "Completado",
    atrasado1: "Atrasado (1d)",
    atrasado2: "Atrasado (2d+)",
    remediacion: "En Remediación",
    pendiente: "Pendiente",
  };
  return map[level];
}
