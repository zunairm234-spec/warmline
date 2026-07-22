import {
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "./Supabase.js";

import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ClientsView from "./components/ClientsView";
import PipelineView from "./components/PipelineView";
import ComingSoonView from "./components/ComingSoonView";
import ClientDrawer from "./components/ClientDrawer";
import NewClientModal from "./components/NewClientModal";
import ImportClientsModal from "./components/ImportClientsModal";
import SettingsModal from "./components/SettingsModal";

import {
  loadClients,
  createClient as createClientInDatabase,
  updateClient as updateClientInDatabase,
  deleteClient as deleteClientFromDatabase,
  bulkCreateClients,
  loadApiKey,
  saveApiKey,
  loadAISettings,
  saveAISettings,
  loadTheme,
  saveTheme,
} from "./lib/storage";

import {
  DEFAULT_AI_SETTINGS,
} from "./lib/constants";

import {
  uid,
  isoDate,
} from "./lib/helpers";

import "./App.css";


export default function App() {

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const [session, setSession] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);


  // ==========================================
  // CRM STATE
  // ==========================================

  const [clients, setClients] =
    useState([]);

  const [loaded, setLoaded] =
    useState(false);

  const [view, setView] =
    useState("dashboard");

  const [theme, setTheme] =
    useState("light");

  const [selectedId, setSelectedId] =
    useState(null);

  const [drawerTab, setDrawerTab] =
    useState("details");


  // ==========================================
  // MODALS
  // ==========================================

  const [showNewModal, setShowNewModal] =
    useState(false);

  const [showImportModal, setShowImportModal] =
    useState(false);

  const [showSettings, setShowSettings] =
    useState(false);


  // ==========================================
  // AI SETTINGS
  // ==========================================

  const [aiSettings, setAiSettings] =
    useState(
      DEFAULT_AI_SETTINGS
    );


  // ==========================================
  // TOAST
  // ==========================================

  const [toast, setToast] =
    useState("");

  const toastTimer =
    useRef(null);


  // ==========================================
  // CHECK AUTHENTICATION
  // ==========================================

  useEffect(() => {

    async function checkSession() {

      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      setSession(session);

      setAuthLoading(false);
    }


    checkSession();


    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {

          setSession(session);

          setAuthLoading(false);

        }
      );


    return () => {

      subscription.unsubscribe();

    };

  }, []);


  // ==========================================
  // LOAD USER CRM DATA
  // ==========================================

  useEffect(() => {

    if (!session) {

      setClients([]);

      setLoaded(false);

      return;

    }


    async function loadUserData() {

      try {

        setLoaded(false);


        const userClients =
          await loadClients();


        setClients(
          userClients
        );


        // Load AI settings

        const savedAISettings =
          loadAISettings();


        setAiSettings(
          savedAISettings
        );


        // Load theme

        setTheme(
          loadTheme()
        );


      } catch (error) {

        console.error(
          "Failed to load user data:",
          error
        );


        showToast(
          "Could not load your CRM data."
        );

      } finally {

        setLoaded(true);

      }

    }


    loadUserData();

  }, [session]);


  // ==========================================
  // TOAST
  // ==========================================

  function showToast(
    message
  ) {

    setToast(
      message
    );


    clearTimeout(
      toastTimer.current
    );


    toastTimer.current =
      setTimeout(
        () => {

          setToast("");

        },
        2500
      );

  }


  // ==========================================
  // CREATE CLIENT
  // ==========================================

  async function createClient(
    newClient
  ) {

    try {

      const savedClient =
        await createClientInDatabase(
          newClient
        );


      setClients(
        (currentClients) => [
          savedClient,
          ...currentClients,
        ]
      );


      setShowNewModal(
        false
      );


      showToast(
        "Client added"
      );


    } catch (error) {

      console.error(
        "Failed to create client:",
        error
      );


      showToast(
        "Couldn't add client."
      );

    }

  }


  // ==========================================
  // BULK IMPORT CLIENTS
  // ==========================================

  async function importClients(
    importedClients
  ) {

    try {

      if (
        !importedClients ||
        importedClients.length === 0
      ) {

        showToast(
          "No clients to import."
        );

        return;

      }


      const savedClients =
        await bulkCreateClients(
          importedClients
        );


      setClients(
        (currentClients) => [
          ...savedClients,
          ...currentClients,
        ]
      );


      setShowImportModal(
        false
      );


      showToast(
        `${savedClients.length} clients imported successfully`
      );


    } catch (error) {

      console.error(
        "Failed to import clients:",
        error
      );


      showToast(
        "Couldn't import clients."
      );


      throw error;

    }

  }


  // ==========================================
  // UPDATE CLIENT
  // ==========================================

  async function updateClient(
    updated
  ) {

    try {

      const savedClient =
        await updateClientInDatabase(
          updated
        );


      setClients(
        (currentClients) =>
          currentClients.map(
            (client) =>
              client.id ===
              updated.id
                ? {
                    ...client,
                    ...updated,
                    ...savedClient,
                  }
                : client
          )
      );


      showToast(
        "Client updated"
      );

      return savedClient;


    } catch (error) {

      console.error(
        "Failed to update client:",
        error
      );


      showToast(
        "Couldn't update client."
      );

      throw error;

    }

  }


  // ==========================================
  // DELETE CLIENT
  // ==========================================

  async function deleteClient(
    id
  ) {

    try {

      await deleteClientFromDatabase(
        id
      );


      setClients(
        (currentClients) =>
          currentClients.filter(
            (client) =>
              client.id !== id
          )
      );


      setSelectedId(
        null
      );


      showToast(
        "Client deleted"
      );


    } catch (error) {

      console.error(
        "Failed to delete client:",
        error
      );


      showToast(
        "Couldn't delete client."
      );

    }

  }


  // ==========================================
  // CHANGE PIPELINE STAGE
  // ==========================================

  async function changeStage(
    id,
    stage
  ) {

    const client =
      clients.find(
        (c) =>
          c.id === id
      );


    if (!client) {
      return;
    }


    try {

      const updatedClient = {
        ...client,
        stage,
      };


      await updateClientInDatabase(
        updatedClient
      );


      setClients(
        (currentClients) =>
          currentClients.map(
            (c) =>
              c.id === id
                ? {
                    ...c,
                    stage,
                  }
                : c
          )
      );


      showToast(
        "Pipeline stage updated"
      );


    } catch (error) {

      console.error(
        "Failed to update pipeline stage:",
        error
      );


      showToast(
        "Couldn't update pipeline stage."
      );

    }

  }


  // ==========================================
  // LOG CONTACT
  // ==========================================

  async function logContact(
    id
  ) {

    const client =
      clients.find(
        (c) =>
          c.id === id
      );


    if (!client) {
      return;
    }


    const today =
      isoDate(
        new Date()
      );


    const newActivity = {

      id:
        uid(),

      date:
        today,

      type:
        "Note",

      note:
        "Marked as contacted.",

    };


    const updatedClient = {

      ...client,

      lastContactDate:
        today,

      activityLog: [

        newActivity,

        ...(client.activityLog ||
          []),

      ],

    };


    try {

      await updateClientInDatabase(
        updatedClient
      );


      setClients(
        (currentClients) =>
          currentClients.map(
            (c) =>
              c.id === id
                ? updatedClient
                : c
          )
      );


      showToast(
        "Logged as contacted today"
      );

      return updatedClient;


    } catch (error) {

      console.error(
        "Failed to log contact:",
        error
      );


      showToast(
        "Couldn't log contact."
      );

      throw error;

    }

  }


  // ==========================================
  // OPEN CLIENT
  // ==========================================

  function openClient(
    id,
    tab
  ) {

    setSelectedId(
      id
    );


    setDrawerTab(
      tab ||
        "details"
    );

  }


  // ==========================================
  // CHANGE THEME
  // ==========================================

  function toggleTheme() {

    const nextTheme =
      theme ===
      "light"
        ? "dark"
        : "light";


    setTheme(
      nextTheme
    );


    saveTheme(
      nextTheme
    );

  }


  // ==========================================
  // SAVE AI SETTINGS
  // ==========================================

  function handleSaveAISettings(
    settings
  ) {

    setAiSettings(
      settings
    );


    saveAISettings(
      settings
    );


    showToast(
      settings.apiKey
        ? "AI settings saved"
        : "AI settings saved without an API key"
    );

  }


  // ==========================================
  // SIGN OUT
  // ==========================================

  async function handleSignOut() {

    await supabase.auth.signOut();


    setClients([]);

    setSelectedId(
      null
    );

    setView(
      "dashboard"
    );

  }


  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (authLoading) {

    return (
      <div className="empty-state">

        Loading Warmline...

      </div>
    );

  }


  // ==========================================
  // LOGIN / SIGN UP
  // ==========================================

  if (!session) {

    return (
      <Auth />
    );

  }


  // ==========================================
  // SELECTED CLIENT
  // ==========================================

  const selectedClient =
    clients.find(
      (c) =>
        c.id ===
        selectedId
    );


  // ==========================================
  // CRM APPLICATION
  // ==========================================

  return (

    <div
      className={`crm-root ${theme}`}
    >

      <Sidebar
        view={
          view
        }

        onNavigate={
          setView
        }

        onNewClient={() =>
          setShowNewModal(
            true
          )
        }

        onOpenSettings={() =>
          setShowSettings(
            true
          )
        }

        settingsOpen={
          showSettings
        }

        theme={
          theme
        }

        onToggleTheme={
          toggleTheme
        }

        onSignOut={
          handleSignOut
        }
      />


      <main className="main">

        {!loaded ? (

          <div
            className="empty-state"
            style={{
              paddingTop: 80,
            }}
          >

            Loading your clients...

          </div>

        ) : (

          <>

            {view ===
              "dashboard" && (

              <Dashboard
                clients={
                  clients
                }

                onOpenClient={
                  openClient
                }

                onLogContact={
                  logContact
                }
              />

            )}


            {view ===
              "clients" && (

              <ClientsView
                clients={
                  clients
                }

                onOpenClient={
                  openClient
                }

                onNewClient={() =>
                  setShowNewModal(
                    true
                  )
                }

                onImportClients={() =>
                  setShowImportModal(
                    true
                  )
                }
              />

            )}


            {view ===
              "pipeline" && (

              <PipelineView
                clients={
                  clients
                }

                onOpenClient={
                  openClient
                }

                onChangeStage={
                  changeStage
                }
              />

            )}

            {![
              "dashboard",
              "clients",
              "pipeline",
            ].includes(view) && (

              <ComingSoonView
                view={view}
                onBackToDashboard={() =>
                  setView("dashboard")
                }
              />

            )}

          </>

        )}

      </main>


      {/* CLIENT DRAWER */}

      {selectedClient && (

        <ClientDrawer

          client={
            selectedClient
          }

          initialTab={
            drawerTab
          }

          aiSettings={
            aiSettings
          }

          onClose={() =>
            setSelectedId(
              null
            )
          }

          onUpdate={
            updateClient
          }

          onDelete={
            deleteClient
          }

          onLogContact={
            logContact
          }

        />

      )}


      {/* NEW CLIENT */}

      {showNewModal && (

        <NewClientModal

          onClose={() =>
            setShowNewModal(
              false
            )
          }

          onCreate={
            createClient
          }

        />

      )}


      {/* IMPORT CLIENTS */}

      {showImportModal && (

        <ImportClientsModal

          onClose={() =>
            setShowImportModal(
              false
            )
          }

          onImport={
            importClients
          }

          existingClients={
            clients
          }

        />

      )}


      {/* AI SETTINGS */}

      {showSettings && (

        <SettingsModal

          currentSettings={
            aiSettings
          }

          onClose={() =>
            setShowSettings(
              false
            )
          }

          onSave={
            handleSaveAISettings
          }

        />

      )}


      {/* TOAST */}

      {toast && (

        <div className="toast">

          {toast}

        </div>

      )}

    </div>

  );

}