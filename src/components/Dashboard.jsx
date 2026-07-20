import { useMemo } from "react";
import { Clock, Sparkles, Check } from "lucide-react";
import ColdClock from "./ui/ColdClock";
import { StagePill } from "./ui/Badges";
import { daysSince, isoDate, money } from "../lib/helpers";

const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

export default function Dashboard({ clients, onOpenClient, onLogContact }) {
  const today = isoDate(new Date());

  const stats = useMemo(() => {
    const active = clients.filter((c) => c.stage !== "Won" && c.stage !== "Lost");
    const needsFollowUp = clients.filter((c) => {
      if (c.stage === "Won" || c.stage === "Lost") return false;
      const overdueByDate = c.nextFollowUpDate && c.nextFollowUpDate <= today;
      const overdueByHeat = daysSince(c.lastContactDate) >= 8;
      return overdueByDate || overdueByHeat;
    });
    const pipelineValue = active.reduce((sum, c) => sum + (Number(c.dealValue) || 0), 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const wonThisMonth = clients.filter((c) => c.stage === "Won" && (c.lastContactDate || "").slice(0, 7) === thisMonth);
    return {
      total: clients.length,
      needsFollowUp: needsFollowUp.length,
      pipelineValue,
      wonThisMonth: wonThisMonth.length,
    };
  }, [clients, today]);

  const doToday = useMemo(() => {
    return clients
      .filter((c) => c.stage !== "Won" && c.stage !== "Lost")
      .map((c) => ({ c, days: daysSince(c.lastContactDate), overdue: c.nextFollowUpDate && c.nextFollowUpDate <= today }))
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        if (b.days !== a.days) return b.days - a.days;
        return PRIORITY_WEIGHT[b.c.priority] - PRIORITY_WEIGHT[a.c.priority];
      })
      .slice(0, 8);
  }, [clients, today]);

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1>Good to see you</h1>
          <p className="view-sub">Here's who's waiting on you, and who's about to go cold.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total clients</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card stat-alert">
          <span className="stat-label">Needs follow-up</span>
          <span className="stat-value">{stats.needsFollowUp}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active pipeline value</span>
          <span className="stat-value">{money(stats.pipelineValue)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Won this month</span>
          <span className="stat-value">{stats.wonThisMonth}</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Do this today</h2>
          <span className="view-sub">Sorted by how overdue they are, then priority</span>
        </div>

        {doToday.length === 0 ? (
          <div className="empty-state">
            <Check size={28} strokeWidth={1.6} />
            <p>Nothing urgent — every active client has been contacted recently.</p>
          </div>
        ) : (
          <div className="today-list">
            {doToday.map(({ c, days, overdue }) => (
              <div className="today-row" key={c.id}>
                <ColdClock days={days} size={40} />
                <div className="today-info" onClick={() => onOpenClient(c.id)}>
                  <div className="today-name">
                    {c.name}
                    {overdue && <span className="overdue-flag">overdue</span>}
                  </div>
                  <div className="today-meta">
                    {c.company || "No company"} · <StagePill stage={c.stage} /> · {money(c.dealValue)}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onLogContact(c.id)}>
                  <Clock size={14} /> Log contact
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onOpenClient(c.id, "ai")}>
                  <Sparkles size={14} /> Draft message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
