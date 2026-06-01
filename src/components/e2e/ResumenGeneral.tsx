import { E2E_DAYS } from "@/lib/e2e/constants";
import { statsForTasks } from "@/lib/e2e/stats";
import type { E2ETask } from "@/lib/e2e/types";

type Props = {
  tasks: E2ETask[];
  onSelectDay?: (tabKey: string) => void;
};

export function ResumenGeneral({ tasks, onSelectDay }: Props) {
  const s = statsForTasks(tasks);
  const pct = s.total ? Math.round((s.completado / s.total) * 100) : 0;
  const w = (n: number) => (s.total ? ((n / s.total) * 100).toFixed(1) : "0");

  return (
    <div>
      <div className="e2e-kpi-grid">
        <div className="e2e-kpi">
          <div className="e2e-kpi-label">Total pruebas</div>
          <div className="e2e-kpi-value">{s.total}</div>
          <div className="mt-1 text-xs text-zinc-500">Semana 1 · 5 días</div>
        </div>
        <div className="e2e-kpi">
          <div className="e2e-kpi-label">Completadas</div>
          <div className="e2e-kpi-value text-green-600">{s.completado}</div>
          <div className="mt-1 text-xs text-zinc-500">{pct}% del total</div>
        </div>
        <div className="e2e-kpi">
          <div className="e2e-kpi-label">Atrasadas 1d</div>
          <div className="e2e-kpi-value text-amber-600">{s.atrasado1}</div>
        </div>
        <div className="e2e-kpi">
          <div className="e2e-kpi-label">Atrasadas 2d+</div>
          <div className="e2e-kpi-value text-red-600">{s.atrasado2}</div>
        </div>
        <div className="e2e-kpi">
          <div className="e2e-kpi-label">En remediación</div>
          <div className="e2e-kpi-value text-violet-600">{s.remediacion}</div>
        </div>
        <div className="e2e-kpi">
          <div className="e2e-kpi-label">Pendientes</div>
          <div className="e2e-kpi-value text-blue-600">{s.pendiente}</div>
        </div>
      </div>

      <div className="e2e-progress">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Avance global de pruebas</span>
          <span className="font-mono text-lg font-bold text-green-600">{pct}%</span>
        </div>
        <div className="e2e-progress-track">
          <div className="h-full rounded bg-green-600" style={{ width: `${w(s.completado)}%` }} />
          <div className="h-full rounded bg-amber-600" style={{ width: `${w(s.atrasado1)}%` }} />
          <div className="h-full rounded bg-red-600" style={{ width: `${w(s.atrasado2)}%` }} />
          <div className="h-full rounded bg-violet-600" style={{ width: `${w(s.remediacion)}%` }} />
        </div>
      </div>

      <h3 className="mb-3 text-sm font-bold">
        Vista por día{" "}
        <span className="font-normal text-zinc-500">— clic para ir al detalle</span>
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {E2E_DAYS.map((d) => {
          const propias = tasks.filter((t) => t.fechaInicio === d.date);
          const ds = statsForTasks(propias);
          const gw = propias.length
            ? Math.round((ds.completado / propias.length) * 100)
            : 0;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => onSelectDay?.(d.key)}
              className="rounded-lg border border-zinc-200 bg-white p-4 text-left transition hover:border-indigo-400 hover:shadow-sm"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {d.label}
              </div>
              <div className="mt-1 text-sm font-bold">{d.short}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded bg-zinc-100">
                <div className="h-full bg-green-600" style={{ width: `${gw}%` }} />
              </div>
              <div className="mt-2 flex gap-2 text-[11px] text-zinc-600">
                <span>
                  <strong>{ds.completado}</strong> ok
                </span>
                <span>
                  <strong>{ds.pendiente + ds.atrasado1 + ds.atrasado2}</strong> abiertas
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
