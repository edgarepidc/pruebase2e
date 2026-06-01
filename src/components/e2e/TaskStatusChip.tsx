import type { E2ETask } from "@/lib/e2e/types";
import { delayLevelLabel, getDelayLevel } from "@/lib/e2e/stats";

export function TaskStatusChip({ task }: { task: E2ETask }) {
  const level = getDelayLevel(task);
  return <span className={`e2e-chip ${level}`}>{delayLevelLabel(level)}</span>;
}
