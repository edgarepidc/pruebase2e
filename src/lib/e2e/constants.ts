export const E2E_DAYS = [
  {
    key: "dia1",
    date: "2026-06-01",
    label: "Día 1",
    nombre: "Lunes 01/Jun/2026",
    short: "Lun 01/Jun",
  },
  {
    key: "dia2",
    date: "2026-06-02",
    label: "Día 2",
    nombre: "Martes 02/Jun/2026",
    short: "Mar 02/Jun",
  },
  {
    key: "dia3",
    date: "2026-06-03",
    label: "Día 3",
    nombre: "Miércoles 03/Jun/2026",
    short: "Mié 03/Jun",
  },
  {
    key: "dia4",
    date: "2026-06-04",
    label: "Día 4",
    nombre: "Jueves 04/Jun/2026",
    short: "Jue 04/Jun",
  },
  {
    key: "dia5",
    date: "2026-06-05",
    label: "Día 5",
    nombre: "Viernes 05/Jun/2026",
    short: "Vie 05/Jun",
  },
] as const;

export const E2E_SPRINT_META = {
  title: "Tablero de Seguimiento · Pruebas en Ambiente QA",
  subtitle: "End-to-End · Sistema ADO-EMBUS · Ambiente de Desarrollo QA · Semana 1",
  weekLabel: "01 – 05 Jun 2026",
} as const;

export const E2E_ESTATUS_OPTIONS = [
  "",
  "Completado",
  "ATRASADO",
  "REMEDIACION",
  "Remediación",
] as const;
