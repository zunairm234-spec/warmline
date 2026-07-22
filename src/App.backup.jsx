import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ClientsView from "./components/ClientsView";
import PipelineView from "./components/PipelineView";
import ClientDrawer from "./components/ClientDrawer";
import NewClientModal from "./components/NewClientModal";
import SettingsModal from "./components/SettingsModal";
import { loadClients, saveClients, loadApiKey, saveApiKey, loadTheme, saveTheme } from "./lib/storage";
import { uid, isoDate } from "./lib/helpers";
import "./App.css";

export default function App() {
  const [clients, setClients] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState("light");
  const [selectedId, setSelectedId] = useState(null);
  const [drawerTab, setDrawerTab] = useState("details");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    setClients(loadClients());
    setApiKey(loadApiKey());
    setTheme(loadTheme());
    setLoaded(true);
  }, []);

  const persist = useCallback((next) => {
    setClients(next);
    const ok = saveClients(next);
    if (!ok) showToast("Couldn't save — your changes may not persist.");
  }, []);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  }

  function updateClient(updated) {
    persist(clients.map((c) => (c.id === updated.id ? updated : c)));
  }

  function deleteClient(id) {
    persist(clients.filter((c) => c.id !== id));
    setSelectedId(null);
  }

  function createClient(newClient) {
    persist([newClient, ...clients]);
    setShowNewModal(false);
    showToast("Client added");
  }

  function changeStage(id, stage) {
    persist(clients.map((c) => (c.id === id ? { ...c, stage } : c)));
  }

  function logContact(id) {
    persist(
      clients.map((c) =>
        c.id === id
          ? {
              ...c,
              lastContactDate: isoDate(new Date()),
              activityLog: [
                { id: uid(), date: isoDate(new Date()), type: "Note", note: "Marked as contacted." },
                ...(c.activityLog || []),
              ],
            }
          : c
      )
    );
    showToast("Logged as contacted today");
  }

  function openClient(id, tab) {
    setSelectedId(id);
    setDrawerTab(tab || "details");
  }

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    saveTheme(next);
  }

  function handleSaveApiKey(key) {
    setApiKey(key);
    saveApiKey(key);
    showToast(key ? "API key saved" : "API key removed");
  }

  const selectedClient = clients.find((c) => c.id === selectedId);

  return (
    <div className={`crm-root ${theme}`}>
      <Sidebar
        view={view}
        onNavigate={setView}
        onNewClient={() => setShowNewModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main">
        {!loaded ? (
          <div className="empty-state" style={{ paddingTop: 80 }}>
            Loading your clients…
          </div>
        ) : (
          <>
            {view === "dashboard" && <Dashboard clients={clients} onOpenClient={openClient} onLogContact={logContact} />}
            {view === "clients" && (
              <ClientsView clients={clients} onOpenClient={openClient} onNewClient={() => setShowNewModal(true)} />
            )}
            {view === "pipeline" && <PipelineView clients={clients} onOpenClient={openClient} onChangeStage={changeStage} />}
          </>
        )}
      </main>

      {selectedClient && (
        <ClientDrawer
          client={selectedClient}
          initialTab={drawerTab}
          apiKey={apiKey}
          onClose={() => setSelectedId(null)}
          onUpdate={updateClient}
          onDelete={deleteClient}
          onLogContact={logContact}
        />
      )}

      {showNewModal && <NewClientModal onClose={() => setShowNewModal(false)} onCreate={createClient} />}

      {showSettings && (
        <SettingsModal currentKey={apiKey} onClose={() => setShowSettings(false)} onSave={handleSaveApiKey} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
