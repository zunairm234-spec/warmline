export const API_KEY_STORAGE_KEY = "warmline:ai-api-key";

export const THEME_STORAGE_KEY = "warmline:theme";

export const STAGES = [
  "New Lead",
  "Contacted",
  "Follow-Up",
  "Proposal Sent",
  "Won",
  "Lost",
];

export const PRIORITIES = [
  "High",
  "Medium",
  "Low",
];

export const CHANNELS = [
  {
    id: "email",
    label: "Email",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
  },
];

export const DEFAULT_AI_SETTINGS = {
  provider: "gemini",
  model: "gemini-3.6-flash",
  apiKey: "",
};

export const AI_PROVIDERS = [
  {
    id: "gemini",
    label: "Google Gemini",
    defaultModel: "gemini-3.6-flash",
  },
  {
    id: "anthropic",
    label: "Anthropic Claude",
    defaultModel: "claude-sonnet-4-20250514",
  },
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
  },
];

export const AI_MODEL = DEFAULT_AI_SETTINGS.model;

export function normalizeGeminiModel(model) {
  return String(model || "")
    .trim()
    .replace(/^models\//, "")
    .replace(/:generateContent$/, "");
}