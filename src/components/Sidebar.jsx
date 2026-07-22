import { Moon, Plus, SunMedium, Sparkles } from "lucide-react";
import { BOTTOM_NAV_ITEMS, NAV_SECTIONS } from "../lib/navigation";

export default function Sidebar({
  view,
  onNavigate,
  onNewClient,
  onOpenSettings,
  settingsOpen,
  theme,
  onToggleTheme,
}) {
  function handleNavigation(item) {
    if (item.id === "settings") {
      onOpenSettings();
      return;
    }

    onNavigate(item.id);
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={14} />
        </div>
        <span className="brand-name">Warmline</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => (
          <div className="nav-section" key={section.label}>
            <div className="nav-section-label">{section.label}</div>

            {section.items.map((item) => {
              const Icon = item.Icon;

              return (
                <button
                  key={item.id}
                  className={`nav-btn ${view === item.id ? "nav-active" : ""}`}
                  onClick={() => handleNavigation(item)}
                  title={item.label}
                >
                  <Icon size={16} strokeWidth={2.1} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="btn btn-primary" onClick={onNewClient}>
          <Plus size={15} /> New client
        </button>

        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.Icon;
          const active = item.id === "settings" ? settingsOpen : view === item.id;

          return (
            <button
              key={item.id}
              className={`theme-toggle ${active ? "bottom-nav-active" : ""}`}
              onClick={() => handleNavigation(item)}
              title={item.label}
            >
              <Icon size={13} /> {item.label}
            </button>
          );
        })}

        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === "light" ? <Moon size={13} /> : <SunMedium size={13} />}
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </div>
    </aside>
  );
}
