"use client";

import { downloadTasksCsv } from "@/lib/e2e/export-csv";
import { downloadTasksXlsx } from "@/lib/e2e/export-xlsx";
import type { E2ETask } from "@/lib/e2e/types";

type Props = {
  tasks: E2ETask[];
  /** Vista actual para el nombre del archivo (opcional). */
  viewLabel?: string;
};

function buildFilename(viewLabel: string | undefined, ext: "csv" | "xlsx") {
  const date = new Date().toISOString().slice(0, 10);
  const suffix = viewLabel
    ? `-${viewLabel.replace(/[^\w-]+/g, "_")}`
    : "";
  return `tablero-e2e-${date}${suffix}.${ext}`;
}

export function E2eExportButton({ tasks, viewLabel }: Props) {
  const disabled = tasks.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          downloadTasksCsv(tasks, buildFilename(viewLabel, "csv"))
        }
        disabled={disabled}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      >
        ⬇ CSV
      </button>
      <button
        type="button"
        onClick={() =>
          downloadTasksXlsx(tasks, buildFilename(viewLabel, "xlsx"))
        }
        disabled={disabled}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      >
        ⬇ Excel (.xlsx)
      </button>
    </div>
  );
}
