export type E2ETask = {
  id: string;
  externalId: number;
  actividad: string;
  responsable: string;
  flujo: string;
  fechaInicio: string;
  nuevaFecha: string;
  estatus: string;
  comentarios: string;
  personaAsignada?: string | null;
};

export type E2ETaskKPI = {
  total: number;
  completado: number;
  atrasado1: number;
  atrasado2: number;
  remediacion: number;
  pendiente: number;
};
