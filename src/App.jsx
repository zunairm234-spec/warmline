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
import TasksView from "./components/TasksView";
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
  loadTasks,
  createTask as createTaskInDatabase,
  updateTask as updateTaskInDatabase,
  completeTask as completeTaskInDatabase,
  deleteTask as deleteTaskFromDatabase,
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

  const [tasks, setTasks] =
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

        let userTasks = [];

        try {
          userTasks = await loadTasks();
        } catch (taskError) {
          console.error(
            "Failed to load tasks:",
            taskError
          );

          showToast(
            "Tasks are unavailable until the Tasks table is created in Supabase."
          );
        }


        setClients(
          userClients
        );

        setTasks(
          userTasks
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
  // TASKS
  // ==========================================

  async function createTask(task) {
    const savedTask =
      await createTaskInDatabase(task);

    setTasks(
      (currentTasks) => [
        savedTask,
        ...currentTasks,
      ]
    );

    showToast("Task created");

    return savedTask;
  }

  async function updateTask(task) {
    const savedTask =
      await updateTaskInDatabase(task);

    setTasks(
      (currentTasks) =>
        currentTasks.map(
          (currentTask) =>
            currentTask.id === task.id
              ? savedTask
              : currentTask
        )
    );

    showToast("Task updated");

    return savedTask;
  }

  async function completeTask(task) {
    const shouldComplete =
      task.status !== "completed";

    const savedTask =
      await completeTaskInDatabase(
        task.id,
        shouldComplete
      );

    setTasks(
      (currentTasks) =>
        currentTasks.map(
          (currentTask) =>
            currentTask.id === task.id
              ? savedTask
              : currentTask
        )
    );

    if (
      shouldComplete &&
      task.clientId
    ) {
      const client =
        clients.find(
          (currentClient) =>
            currentClient.id === task.clientId
        );

      const alreadyLogged =
        client?.activityLog?.some(
          (activity) =>
            activity.type === "task_completed" &&
            activity.taskId === task.id
        );

      if (client && !alreadyLogged) {
        const updatedClient = {
          ...client,
          activityLog: [
            {
              id: uid(),
              date: isoDate(new Date()),
              type: "task_completed",
              note: `Completed task: ${task.title}`,
              taskId: task.id,
            },
            ...(client.activityLog || []),
          ],
        };

        const savedClient =
          await updateClientInDatabase(
            updatedClient
          );

        setClients(
          (currentClients) =>
            currentClients.map(
              (currentClient) =>
                currentClient.id === client.id
                  ? savedClient
                  : currentClient
            )
        );
      }
    }

    showToast(
      shouldComplete
        ? "Task completed"
        : "Task reopened"
    );

    return savedTask;
  }

  async function deleteTask(id) {
    await deleteTaskFromDatabase(id);

    setTasks(
      (currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== id
        )
    );

    showToast("Task deleted");
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

                userName={
                  session?.user?.user_metadata?.full_name ||
                  session?.user?.user_metadata?.name ||
                  ""
                }

                onOpenClient={
                  openClient
                }

                onNewClient={() =>
                  setShowNewModal(
                    true
                  )
                }

                onNavigate={
                  setView
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

            {view ===
              "tasks" && (

              <TasksView
                tasks={tasks}
                clients={clients}
                onCreateTask={createTask}
                onUpdateTask={updateTask}
                onCompleteTask={completeTask}
                onDeleteTask={deleteTask}
              />

            )}

            {![
              "dashboard",
              "clients",
              "pipeline",
              "tasks",
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

          tasks={
            tasks.filter(
              (task) =>
                task.clientId === selectedClient.id
            )
          }

          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onCompleteTask={completeTask}
          onDeleteTask={deleteTask}

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