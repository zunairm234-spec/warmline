import { useMemo, useState } from "react";
import { Plus, Search, Users, ChevronRight } from "lucide-react";
import ColdClock from "./ui/ColdClock";
import { StagePill, PriorityPill } from "./ui/Badges";
import { daysSince, formatDate, money } from "../lib/helpers";
import { STAGES } from "../lib/constants";

export default function ClientsView({ clients, onOpenClient, onNewClient }) {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [sortBy, setSortBy] = useState("heat");

  const filtered = useMemo(() => {
    let list = clients.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.company || "").toLowerCase().includes(query.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(query.toLowerCase());
      const matchesStage = stageFilter === "All" || c.stage === stageFilter;
      return matchesQuery && matchesStage;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "heat") return daysSince(b.lastContactDate) - daysSince(a.lastContactDate);
      if (sortBy === "value") return (Number(b.dealValue) || 0) - (Number(a.dealValue) || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [clients, query, stageFilter, sortBy]);

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1>Clients</h1>
          <p className="view-sub">{clients.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={onNewClient}>
          <Plus size={16} /> New client
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input placeholder="Search name, company, email…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="select" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option>All</option>
          {STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="heat">Sort: Most overdue</option>
          <option value="value">Sort: Deal value</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Users size={28} strokeWidth={1.6} />
            <p>No clients match. Try a different search or add a new one.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Client</th>
                <th>Stage</th>
                <th>Priority</th>
                <th>Deal value</th>
                <th>Last contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => onOpenClient(c.id)}>
                  <td>
                    <ColdClock days={daysSince(c.lastContactDate)} size={36} />
                  </td>
                  <td>
                    <div className="cell-name">{c.name}</div>
                    <div className="cell-sub">{c.company || "—"}</div>
                  </td>
                  <td>
                    <StagePill stage={c.stage} />
                  </td>
                  <td>
                    <PriorityPill priority={c.priority} />
                  </td>
                  <td className="mono">{money(c.dealValue)}</td>
                  <td className="mono">{formatDate(c.lastContactDate)}</td>
                  <td>
                    <ChevronRight size={16} className="row-arrow" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
