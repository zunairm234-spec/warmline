export const CLIENTS_STORAGE_KEY = "warmline:clients";
export const API_KEY_STORAGE_KEY = "warmline:anthropic-api-key";
export const THEME_STORAGE_KEY = "warmline:theme";

export const STAGES = ["New Lead", "Contacted", "Follow-Up", "Proposal Sent", "Won", "Lost"];

export const PRIORITIES = ["High", "Medium", "Low"];

export const CHANNELS = [
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "linkedin", label: "LinkedIn" },
];

// The model used for AI drafts and insights. Update this if Anthropic
// releases a newer model you'd rather use — see docs.claude.com/en/docs/about-claude/models
export const AI_MODEL = "claude-sonnet-5";
