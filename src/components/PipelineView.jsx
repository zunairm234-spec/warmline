import { useMemo, useState } from "react";
import ColdClock from "./ui/ColdClock";
import { PriorityPill } from "./ui/Badges";
import { daysSince, money } from "../lib/helpers";
import { STAGES } from "../lib/constants";

export default function PipelineView({ clients, onOpenClient, onChangeStage }) {
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  const columns = useMemo(() => {
    const map = {};
    STAGES.forEach((s) => (map[s] = []));
    clients.forEach((c) => {
      if (map[c.stage]) map[c.stage].push(c);
    });
    return map;
  }, [clients]);

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1>Pipeline</h1>
          <p className="view-sub">Drag a card to move it through the process</p>
        </div>
      </div>

      <div className="kanban">
        {STAGES.map((stage) => {
          const items = columns[stage] || [];
          const total = items.reduce((s, c) => s + (Number(c.dealValue) || 0), 0);
          return (
            <div
              key={stage}
              className={`kanban-col ${overStage === stage ? "kanban-col-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStage(stage);
              }}
              onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) onChangeStage(dragId, stage);
                setDragId(null);
                setOverStage(null);
              }}
            >
              <div className="kanban-col-head">
                <span className="kanban-col-title">{stage}</span>
                <span className="kanban-col-count">{items.length}</span>
              </div>
              <div className="kanban-col-total mono">{money(total)}</div>
              <div className="kanban-col-body">
                {items.map((c) => (
                  <div
                    key={c.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onClick={() => onOpenClient(c.id)}
                  >
                    <div className="kanban-card-top">
                      <span className="kanban-card-name">{c.name}</span>
                      <ColdClock days={daysSince(c.lastContactDate)} size={28} />
                    </div>
                    <div className="kanban-card-company">{c.company || "—"}</div>
                    <div className="kanban-card-bottom">
                      <span className="mono">{money(c.dealValue)}</span>
                      <PriorityPill priority={c.priority} />
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="kanban-empty">Drop here</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
