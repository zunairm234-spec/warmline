import { LayoutDashboard, Users, Kanban, Plus, Moon, SunMedium, Sparkles, Settings } from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "clients", label: "Clients", Icon: Users },
  { id: "pipeline", label: "Pipeline", Icon: Kanban },
];

export default function Sidebar({ view, onNavigate, onNewClient, onOpenSettings, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={14} />
        </div>
        <span className="brand-name">Warmline</span>
      </div>

      {NAV.map(({ id, label, Icon }) => (
        <button key={id} className={`nav-btn ${view === id ? "nav-active" : ""}`} onClick={() => onNavigate(id)}>
          <Icon size={17} strokeWidth={2.1} /> {label}
        </button>
      ))}

      <div className="sidebar-bottom">
        <button className="btn btn-primary" onClick={onNewClient}>
          <Plus size={15} /> New client
        </button>
        <button className="theme-toggle" onClick={onOpenSettings}>
          <Settings size={13} /> Settings
        </button>
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === "light" ? <Moon size={13} /> : <SunMedium size={13} />}
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </div>
    </aside>
  );
}
