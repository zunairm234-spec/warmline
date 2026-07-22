import { supabase } from "../Supabase.js";

import {
  API_KEY_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "./constants.js";

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
// AI API KEY
// ============================================================

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
// ==========================================
// AI SETTINGS
// ==========================================

export function loadAISettings() {
  try {
    const saved = localStorage.getItem(
      API_KEY_STORAGE_KEY
    );

    if (!saved) {
      return {
        provider: "gemini",
        model: "gemini-2.5-flash",
        apiKey: "",
      };
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error(
      "Failed to load AI settings:",
      error
    );

    return {
      provider: "gemini",
      model: "gemini-2.5-flash",
      apiKey: "",
    };
  }
}


export function saveAISettings(
  settings
) {
  try {
    localStorage.setItem(
      API_KEY_STORAGE_KEY,
      JSON.stringify(settings)
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