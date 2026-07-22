import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  ListChecks,
  Plus,
  Users,
} from "lucide-react";
import ColdClock from "./ui/ColdClock";
import { PriorityPill, StagePill } from "./ui/Badges";
import { daysSince, formatDate, isoDate, money } from "../lib/helpers";
import { STAGES } from "../lib/constants";

const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };
const CLOSED_STAGES = new Set(["Won", "Lost"]);

export default function Dashboard({
  clients,
  userName,
  onOpenClient,
  onNewClient,
  onNavigate,
}) {
  const today = isoDate(new Date());

  const dashboardData = useMemo(() => {
    const active = clients.filter((client) => !CLOSED_STAGES.has(client.stage));
    const overdue = active.filter((client) => client.nextFollowUpDate && client.nextFollowUpDate < today);
    const dueToday = active.filter((client) => client.nextFollowUpDate === today);
    const upcoming = active
      .filter((client) => client.nextFollowUpDate && client.nextFollowUpDate > today)
      .sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate));

    const priorityClients = active
      .filter((client) =>
        (client.nextFollowUpDate && client.nextFollowUpDate <= today) ||
        daysSince(client.lastContactDate) >= 8
      )
      .map((client) => ({
        client,
        days: daysSince(client.lastContactDate),
        overdue: client.nextFollowUpDate && client.nextFollowUpDate < today,
        dueToday: client.nextFollowUpDate === today,
      }))
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        if (a.dueToday !== b.dueToday) return a.dueToday ? -1 : 1;
        if (PRIORITY_WEIGHT[b.client.priority] !== PRIORITY_WEIGHT[a.client.priority]) {
          return PRIORITY_WEIGHT[b.client.priority] - PRIORITY_WEIGHT[a.client.priority];
        }
        if ((Number(b.client.dealValue) || 0) !== (Number(a.client.dealValue) || 0)) {
          return (Number(b.client.dealValue) || 0) - (Number(a.client.dealValue) || 0);
        }
        return b.days - a.days;
      })
      .slice(0, 5);

    const recentActivity = clients
      .flatMap((client) =>
        (client.activityLog || []).map((activity) => ({
          ...activity,
          client,
        }))
      )
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .slice(0, 8);

    const pipeline = STAGES.map((stage) => {
      const stageClients = clients.filter((client) => client.stage === stage);
      return {
        stage,
        count: stageClients.length,
        value: stageClients.reduce((sum, client) => sum + (Number(client.dealValue) || 0), 0),
      };
    });

    return {
      active,
      overdue,
      dueToday,
      upcoming,
      priorityClients,
      recentActivity,
      pipeline,
      pipelineValue: active.reduce((sum, client) => sum + (Number(client.dealValue) || 0), 0),
    };
  }, [clients, today]);

  const firstName = userName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Good morning, ${firstName}` : "Good morning";

  function FollowUpRow({ client }) {
    return (
      <button className="dashboard-list-row" onClick={() => onOpenClient(client.id)}>
        <div className="dashboard-row-main">
          <strong>{client.name || "Unnamed client"}</strong>
          <span>{client.company || "No company"}</span>
        </div>
        <div className="dashboard-row-meta">
          <PriorityPill priority={client.priority} />
          <StagePill stage={client.stage} />
          <span className="mono">{formatDate(client.nextFollowUpDate)}</span>
        </div>
        <ChevronRight size={15} />
      </button>
    );
  }

  return (
    <div className="view">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Daily command center</span>
          <h1>{greeting}</h1>
          <p className="view-sub">Here's what needs your attention today.</p>
        </div>
        <button className="btn btn-primary" onClick={onNewClient}>
          <Plus size={16} /> New Client
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <Users size={17} />
          <span className="stat-label">Total clients</span>
          <span className="stat-value">{clients.length}</span>
        </div>
        <div className="stat-card stat-alert">
          <CalendarClock size={17} />
          <span className="stat-label">Follow-ups due</span>
          <span className="stat-value">{dashboardData.dueToday.length}</span>
        </div>
        <div className="stat-card">
          <ListChecks size={17} />
          <span className="stat-label">Active pipeline</span>
          <span className="stat-value">{dashboardData.active.length}</span>
        </div>
        <div className="stat-card stat-alert">
          <Clock size={17} />
          <span className="stat-label">Overdue</span>
          <span className="stat-value">{dashboardData.overdue.length}</span>
        </div>
        <div className="stat-card">
          <DollarSign size={17} />
          <span className="stat-label">Pipeline value</span>
          <span className="stat-value">{money(dashboardData.pipelineValue)}</span>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-main">
        <section className="panel dashboard-section">
          <div className="panel-head">
            <div>
              <h2>Today's priorities</h2>
              <span className="view-sub">The clients most likely to need action now</span>
            </div>
            <Activity size={17} />
          </div>

          {dashboardData.priorityClients.length === 0 ? (
            <div className="empty-state dashboard-empty">
              <Check size={26} strokeWidth={1.6} />
              <p>You're all caught up.</p>
            </div>
          ) : (
            <div className="dashboard-priority-list">
              {dashboardData.priorityClients.map(({ client, days, overdue, dueToday }) => (
                <div className="priority-row" key={client.id}>
                  <ColdClock days={days} size={36} />
                  <div className="dashboard-row-main">
                    <strong>{client.name || "Unnamed client"}</strong>
                    <span>{client.company || "No company"}</span>
                    <div className="dashboard-inline-meta">
                      <StagePill stage={client.stage} />
                      <PriorityPill priority={client.priority} />
                      {client.dealValue > 0 && <span className="mono">{money(client.dealValue)}</span>}
                    </div>
                  </div>
                  <div className={`follow-up-flag ${overdue ? "is-overdue" : ""}`}>
                    {overdue ? "Overdue" : dueToday ? "Due today" : `${days}d since contact`}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => onOpenClient(client.id)}>
                    Open <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel dashboard-section">
          <div className="panel-head">
            <div>
              <h2>Follow-ups</h2>
              <span className="view-sub">Scheduled relationship touchpoints</span>
            </div>
            <CalendarClock size={17} />
          </div>

          <div className="follow-up-groups">
            <div>
              <h3 className="dashboard-group-title overdue-title">Overdue <span>{dashboardData.overdue.length}</span></h3>
              {dashboardData.overdue.slice(0, 5).map((client) => <FollowUpRow key={client.id} client={client} />)}
              {dashboardData.overdue.length === 0 && <p className="dashboard-muted">No overdue follow-ups.</p>}
            </div>
            <div>
              <h3 className="dashboard-group-title">Due today <span>{dashboardData.dueToday.length}</span></h3>
              {dashboardData.dueToday.slice(0, 5).map((client) => <FollowUpRow key={client.id} client={client} />)}
              {dashboardData.dueToday.length === 0 && <p className="dashboard-muted">Nothing scheduled today.</p>}
            </div>
            <div>
              <h3 className="dashboard-group-title">Upcoming <span>{dashboardData.upcoming.length}</span></h3>
              {dashboardData.upcoming.slice(0, 5).map((client) => <FollowUpRow key={client.id} client={client} />)}
              {dashboardData.upcoming.length === 0 && <p className="dashboard-muted">No upcoming follow-ups.</p>}
            </div>
          </div>
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid-bottom">
        <section className="panel dashboard-section">
          <div className="panel-head">
            <div>
              <h2>Recent activity</h2>
              <span className="view-sub">The latest interactions across your clients</span>
            </div>
            <Activity size={17} />
          </div>

          {dashboardData.recentActivity.length === 0 ? (
            <div className="empty-state dashboard-empty"><Activity size={26} strokeWidth={1.6} /><p>No activity recorded yet.</p></div>
          ) : (
            <div className="recent-activity-list">
              {dashboardData.recentActivity.map((activity) => (
                <button className="activity-dashboard-row" key={`${activity.client.id}-${activity.id}`} onClick={() => onOpenClient(activity.client.id)}>
                  <span className="activity-dot" />
                  <div className="dashboard-row-main">
                    <strong>{activity.client.name || "Unnamed client"}</strong>
                    <span>{activity.type || "Activity"} · {activity.note || "No description"}</span>
                  </div>
                  <span className="mono">{formatDate(activity.date)}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel dashboard-section">
          <div className="panel-head">
            <div>
              <h2>Pipeline snapshot</h2>
              <span className="view-sub">A quick view of every stage</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("pipeline")}>
              View Pipeline <ArrowRight size={13} />
            </button>
          </div>

          <div className="pipeline-snapshot">
            {dashboardData.pipeline.map(({ stage, count, value }) => (
              <div className="pipeline-snapshot-row" key={stage}>
                <span>{stage}</span>
                <span className="pipeline-snapshot-count">{count}</span>
                <span className="mono">{money(value)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel dashboard-section quick-actions-section">
        <div className="panel-head">
          <div>
            <h2>Quick actions</h2>
            <span className="view-sub">Jump straight into your next CRM task</span>
          </div>
        </div>
        <div className="quick-actions">
          <button className="quick-action" onClick={onNewClient}><Plus size={16} /><span>New Client</span></button>
          <button className="quick-action" onClick={() => onNavigate("clients")}><Users size={16} /><span>View Clients</span></button>
          <button className="quick-action" onClick={() => onNavigate("pipeline")}><BarChart3 size={16} /><span>View Pipeline</span></button>
        </div>
      </section>
    </div>
  );
}
