import { Flame, Sun, Wind, Snowflake } from "lucide-react";
import { getHeat } from "../../lib/helpers";

const HEAT_ICONS = { fresh: Flame, warm: Sun, cooling: Wind, cold: Snowflake };

export function HeatPill({ days }) {
  const heat = getHeat(days);
  const Icon = HEAT_ICONS[heat.key];
  return (
    <span className={`pill heat-pill heat-${heat.key}`}>
      <Icon size={12} strokeWidth={2.4} />
      {heat.label}
    </span>
  );
}

export function StagePill({ stage }) {
  const cls = stage === "Won" ? "stage-won" : stage === "Lost" ? "stage-lost" : "stage-default";
  return <span className={`pill ${cls}`}>{stage}</span>;
}

export function PriorityPill({ priority }) {
  const cls = priority === "High" ? "prio-high" : priority === "Low" ? "prio-low" : "prio-med";
  return <span className={`pill ${cls}`}>{priority}</span>;
}
