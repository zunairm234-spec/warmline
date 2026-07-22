import { supabase } from "../Supabase.js";

import {
  API_KEY_STORAGE_KEY,
  THEME_STORAGE_KEY,
  DEFAULT_AI_SETTINGS,
  normalizeGeminiModel,
} from "./constants.js";

// Dedicated key for AI settings — separate from API_KEY_STORAGE_KEY to avoid
// the two colliding (one is a plain string, the other a JSON object).
const AI_SETTINGS_STORAGE_KEY = "warmline:ai-settings";

// ============================================================
// GET CURRENT USER
// ============================================================

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      "You must be logged in to manage clients."
    );
  }

  return user;
}

// ============================================================
// MAP DATABASE CLIENT TO CRM CLIENT
// ============================================================

function mapClient(client) {
  if (!client) return null;

  return {
    id: client.id,

    name: client.name || "",
    company: client.company || "",

    email: client.email || "",
    phone: client.phone || "",

    dealValue:
      Number(client.deal_value) || 0,

    priority:
      client.priority || "Medium",

    stage:
      client.stage || "New Lead",

    website:
      client.website || "",

    industry:
      client.industry || "",

    whatsapp:
      client.whatsapp || "",

    linkedin:
      client.linkedin || "",

    address:
      client.address || "",

    notes:
      client.notes || "",

    tags:
      Array.isArray(client.tags)
        ? client.tags
        : [],

    leadSource:
      client.lead_source || "",

    lastContactDate:
      client.last_contact_date || null,

    nextFollowUpDate:
      client.next_follow_up_date || null,

    activityLog:
      Array.isArray(client.activity_log)
        ? client.activity_log
        : [],

    aiInsight:
      client.ai_insight || "",

    createdAt:
      client.created_at,

    updatedAt:
      client.updated_at,
  };
}

// ============================================================
// LOAD CLIENTS
// ============================================================

export async function loadClients() {
  const user =
    await getCurrentUser();

  const {
    data,
    error,
  } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Failed to load clients:",
      error
    );

    throw error;
  }

  return (data || []).map(
    mapClient
  );
}

// ============================================================
// CREATE CLIENT
// ============================================================

export async function createClient(
  client
) {
  const user =
    await getCurrentUser();

  const row = {
    user_id: user.id,

    name:
      String(
        client.name || ""
      ).trim(),

    company:
      String(
        client.company || ""
      ).trim(),

    email:
      String(
        client.email || ""
      ).trim(),

    phone:
      String(
        client.phone || ""
      ).trim(),

    deal_value:
      Number(
        client.dealValue
      ) || 0,

    priority:
      client.priority ||
      "Medium",

    stage:
      client.stage ||
      "New Lead",

    website:
      String(
        client.website || ""
      ).trim(),

    industry:
      String(
        client.industry || ""
      ).trim(),

    whatsapp:
      String(
        client.whatsapp || ""
      ).trim(),

    linkedin:
      String(
        client.linkedin || ""
      ).trim(),

    address:
      String(
        client.address || ""
      ).trim(),

    notes:
      String(
        client.notes || ""
      ).trim(),

    tags:
      Array.isArray(client.tags)
        ? client.tags
        : [],

    lead_source:
      String(
        client.leadSource || ""
      ).trim(),

    last_contact_date:
      client.lastContactDate ||
      null,

    next_follow_up_date:
      client.nextFollowUpDate ||
      null,

    activity_log:
      Array.isArray(
        client.activityLog
      )
        ? client.activityLog
        : [],

    ai_insight:
      String(
        client.aiInsight || ""
      ).trim(),
  };

  const {
    data,
    error,
  } = await supabase
    .from("clients")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error(
      "Failed to create client:",
      error
    );

    throw error;
  }

  return mapClient(data);
}

// ============================================================
// UPDATE CLIENT
// ============================================================

export async function updateClient(
  client
) {
  const user =
    await getCurrentUser();

  const updates = {
    name:
      String(
        client.name || ""
      ).trim(),

    company:
      String(
        client.company || ""
      ).trim(),

    email:
      String(
        client.email || ""
      ).trim(),

    phone:
      String(
        client.phone || ""
      ).trim(),

    deal_value:
      Number(
        client.dealValue
      ) || 0,

    priority:
      client.priority ||
      "Medium",

    stage:
      client.stage ||
      "New Lead",

    website:
      String(
        client.website || ""
      ).trim(),

    industry:
      String(
        client.industry || ""
      ).trim(),

    whatsapp:
      String(
        client.whatsapp || ""
      ).trim(),

    linkedin:
      String(
        client.linkedin || ""
      ).trim(),

    address:
      String(
        client.address || ""
      ).trim(),

    notes:
      String(
        client.notes || ""
      ).trim(),

    tags:
      Array.isArray(client.tags)
        ? client.tags
        : [],

    lead_source:
      String(
        client.leadSource || ""
      ).trim(),

    last_contact_date:
      client.lastContactDate ||
      null,

    next_follow_up_date:
      client.nextFollowUpDate ||
      null,

    activity_log:
      Array.isArray(
        client.activityLog
      )
        ? client.activityLog
        : [],

    ai_insight:
      String(
        client.aiInsight || ""
      ).trim(),

    updated_at:
      new Date().toISOString(),
  };

  const {
    data,
    error,
  } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", client.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error(
      "Failed to update client:",
      error
    );

    throw error;
  }

  return mapClient(data);
}

// ============================================================
// DELETE CLIENT
// ============================================================

export async function deleteClient(
  id
) {
  const user =
    await getCurrentUser();

  const {
    error,
  } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Failed to delete client:",
      error
    );

    throw error;
  }

  return true;
}

// ============================================================
// BULK CREATE CLIENTS
// ============================================================

export async function bulkCreateClients(
  clients
) {
  const user =
    await getCurrentUser();

  if (
    !Array.isArray(clients) ||
    clients.length === 0
  ) {
    return [];
  }

  const rows = clients
    .filter(
      (client) =>
        client &&
        String(
          client.name || ""
        ).trim() !== ""
    )
    .map((client) => ({
      user_id: user.id,

      name:
        String(
          client.name || ""
        ).trim(),

      company:
        String(
          client.company || ""
        ).trim(),

      email:
        String(
          client.email || ""
        ).trim(),

      phone:
        String(
          client.phone || ""
        ).trim(),

      deal_value:
        Number(
          client.dealValue
        ) || 0,

      priority:
        client.priority ||
        "Medium",

      stage:
        client.stage ||
        "New Lead",

      website:
        String(
          client.website || ""
        ).trim(),

      industry:
        String(
          client.industry || ""
        ).trim(),

      whatsapp:
        String(
          client.whatsapp || ""
        ).trim(),

      linkedin:
        String(
          client.linkedin || ""
        ).trim(),

      address:
        String(
          client.address || ""
        ).trim(),

      notes:
        String(
          client.notes || ""
        ).trim(),

      tags:
        Array.isArray(client.tags)
          ? client.tags
          : [],

      lead_source:
        String(
          client.leadSource || ""
        ).trim(),

      last_contact_date:
        client.lastContactDate ||
        null,

      next_follow_up_date:
        client.nextFollowUpDate ||
        null,

      activity_log:
        Array.isArray(
          client.activityLog
        )
          ? client.activityLog
          : [],

      ai_insight:
        String(
          client.aiInsight || ""
        ).trim(),
    }));

  if (rows.length === 0) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("clients")
    .insert(rows)
    .select();

  if (error) {
    console.error(
      "Failed to bulk import clients:",
      error
    );

    throw error;
  }

  return (data || []).map(
    mapClient
  );
}

// ============================================================
// TASKS
// ============================================================

function mapTask(task) {
  if (!task) return null;

  return {
    id: task.id,
    userId: task.user_id,
    clientId: task.client_id || null,
    title: task.title || "",
    description: task.description || "",
    status: task.status || "open",
    priority: task.priority || "medium",
    dueDate: task.due_date || null,
    completedAt: task.completed_at || null,
    source: task.source || "manual",
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

function taskRow(task) {
  return {
    title: String(task.title || "").trim(),
    description: String(task.description || "").trim() || null,
    client_id: task.clientId || null,
    status: task.status === "completed" ? "completed" : "open",
    priority: ["high", "medium", "low"].includes(task.priority)
      ? task.priority
      : "medium",
    due_date: task.dueDate || null,
    completed_at: task.status === "completed"
      ? task.completedAt || new Date().toISOString()
      : null,
    source: ["manual", "ai", "automation"].includes(task.source)
      ? task.source
      : "manual",
    updated_at: new Date().toISOString(),
  };
}

export async function loadTasks() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load tasks:", error);
    throw error;
  }

  return (data || []).map(mapTask);
}

export async function createTask(task) {
  const user = await getCurrentUser();
  const title = String(task.title || "").trim();

  if (!title) {
    throw new Error("Task title is required.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      ...taskRow({
        ...task,
        title,
        status: "open",
        completedAt: null,
      }),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create task:", error);
    throw error;
  }

  return mapTask(data);
}

export async function updateTask(task) {
  const user = await getCurrentUser();
  const title = String(task.title || "").trim();

  if (!title) {
    throw new Error("Task title is required.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(taskRow({ ...task, title }))
    .eq("id", task.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update task:", error);
    throw error;
  }

  return mapTask(data);
}

export async function completeTask(id, shouldComplete = true) {
  const user = await getCurrentUser();
  const completedAt = shouldComplete ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: shouldComplete ? "completed" : "open",
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to complete task:", error);
    throw error;
  }

  return mapTask(data);
}

export async function deleteTask(id) {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete task:", error);
    throw error;
  }

  return true;
}

// ============================================================
// AI API KEY (LEGACY — currently unused by App.jsx)
// ============================================================
// Not called anywhere in the live app (only referenced in the unused
// App.backup.jsx). Kept for backward compatibility; safe to delete
// once you confirm nothing else needs it.

export function loadApiKey() {
  try {
    return (
      localStorage.getItem(
        API_KEY_STORAGE_KEY
      ) || ""
    );
  } catch {
    return "";
  }
}

export function saveApiKey(
  key
) {
  try {
    if (key) {
      localStorage.setItem(
        API_KEY_STORAGE_KEY,
        key
      );
    } else {
      localStorage.removeItem(
        API_KEY_STORAGE_KEY
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Failed to save API key:",
      error
    );

    return false;
  }
}

// ============================================================
// THEME
// ============================================================

export function loadTheme() {
  try {
    return (
      localStorage.getItem(
        THEME_STORAGE_KEY
      ) || "light"
    );
  } catch {
    return "light";
  }
}

export function saveTheme(
  theme
) {
  try {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      theme
    );

    return true;
  } catch (error) {
    console.error(
      "Failed to save theme:",
      error
    );

    return false;
  }
}

// ============================================================
// AI SETTINGS
// ============================================================
// Single source of truth for defaults is DEFAULT_AI_SETTINGS in
// constants.js — no model name is hardcoded here anymore.

export function loadAISettings() {
  try {
    // One-time migration: earlier versions saved AI settings under
    // API_KEY_STORAGE_KEY, colliding with the plain API key string.
    // If nothing exists under the new dedicated key yet, check the
    // old key, migrate it over, then clean up.
    const current = localStorage.getItem(
      AI_SETTINGS_STORAGE_KEY
    );

    if (current) {
      const settings = {
        ...DEFAULT_AI_SETTINGS,
        ...JSON.parse(current),
      };

      if (settings.provider === "gemini") {
        const normalizedModel =
          normalizeGeminiModel(settings.model);
        const migratedModel =
          normalizedModel === "gemini-2.5-flash"
            ? DEFAULT_AI_SETTINGS.model
            : normalizedModel;

        if (migratedModel !== settings.model) {
          settings.model = migratedModel;

          localStorage.setItem(
            AI_SETTINGS_STORAGE_KEY,
            JSON.stringify(settings)
          );
        }
      }

      return settings;
    }

    const legacy = localStorage.getItem(
      API_KEY_STORAGE_KEY
    );

    if (legacy) {
      try {
        const parsedLegacy = JSON.parse(legacy);

        // Only migrate if it actually looks like a settings object
        // (has a provider/model), not a raw API key string.
        if (parsedLegacy && typeof parsedLegacy === "object" && parsedLegacy.provider) {
          const migrated = {
            ...DEFAULT_AI_SETTINGS,
            ...parsedLegacy,
          };

          if (migrated.provider === "gemini") {
            const normalizedModel =
              normalizeGeminiModel(migrated.model);

            migrated.model =
              normalizedModel === "gemini-2.5-flash"
                ? DEFAULT_AI_SETTINGS.model
                : normalizedModel;
          }

          localStorage.setItem(
            AI_SETTINGS_STORAGE_KEY,
            JSON.stringify(migrated)
          );

          localStorage.removeItem(
            API_KEY_STORAGE_KEY
          );

          return migrated;
        }
      } catch {
        // legacy value wasn't JSON (probably a raw API key string) — ignore
      }
    }

    return { ...DEFAULT_AI_SETTINGS };
  } catch (error) {
    console.error(
      "Failed to load AI settings:",
      error
    );

    return { ...DEFAULT_AI_SETTINGS };
  }
}

export function saveAISettings(
  settings
) {
  try {
    const settingsToSave = {
      ...settings,
    };

    if (settingsToSave.provider === "gemini") {
      const normalizedModel = normalizeGeminiModel(
        settingsToSave.model
      );

      settingsToSave.model =
        normalizedModel === "gemini-2.5-flash"
          ? DEFAULT_AI_SETTINGS.model
          : normalizedModel;
    }

    localStorage.setItem(
      AI_SETTINGS_STORAGE_KEY,
      JSON.stringify(settingsToSave)
    );

    return true;
  } catch (error) {
    console.error(
      "Failed to save AI settings:",
      error
    );

    return false;
  }
}