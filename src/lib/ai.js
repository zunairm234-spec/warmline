import { AI_MODEL } from "./constants";
import { daysSince } from "./helpers";

/**
 * Calls the Anthropic Messages API directly from the browser using the
 * user's own API key.
 *
 * IMPORTANT: this makes the API key visible in the browser's network
 * requests. That's an acceptable tradeoff for a personal tool running only
 * on your own machine, but do NOT deploy this app publicly as-is — anyone
 * who opens dev tools could read the key. For a shared/public deployment,
 * move this call to a small backend that holds the key server-side instead.
 */
export async function callClaude(prompt, apiKey) {
  if (!apiKey) {
    throw new Error("Add your Anthropic API key in Settings to use AI features.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AI request failed (${response.status}). ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("AI returned an empty response.");
  return text;
}

export function buildFollowUpPrompt(client, channel) {
  const days = daysSince(client.lastContactDate);
  const channelNote = {
    email:
      "Write it as a short email, including a one-line subject on the first line prefixed with 'Subject:', then a blank line, then the body.",
    whatsapp: "Write it as a short, casual WhatsApp message — no subject line, 2-4 sentences max.",
    linkedin: "Write it as a brief LinkedIn message — no subject line, warm and professional, under 80 words.",
  }[channel];

  return [
    "You are helping a freelancer/small business owner write a personalized follow-up message to a client they've been slow to get back to because they're busy.",
    "Do not use placeholder brackets like [Name] — use the real details given below. Do not add any preamble, explanation, or markdown formatting — output only the message itself.",
    channelNote,
    "",
    "Client details:",
    `Name: ${client.name}`,
    `Company: ${client.company || "—"}`,
    `Industry: ${client.industry || "—"}`,
    `Current stage: ${client.stage}`,
    `Days since last contact: ${days}`,
    `Notes: ${client.notes || "—"}`,
    `Lead source: ${client.leadSource || "—"}`,
    `Deal value: ${client.dealValue ? "$" + client.dealValue : "—"}`,
  ].join("\n");
}

export function buildInsightPrompt(client) {
  const days = daysSince(client.lastContactDate);
  return [
    "You are a sales assistant giving a busy freelancer a quick, honest read on one client so they know how to prioritize their day.",
    "Respond with exactly 1-2 short sentences, plain text, no markdown, no preamble.",
    "",
    `Name: ${client.name}`,
    `Company: ${client.company || "—"}`,
    `Stage: ${client.stage}`,
    `Priority: ${client.priority}`,
    `Deal value: ${client.dealValue ? "$" + client.dealValue : "—"}`,
    `Days since last contact: ${days}`,
    `Notes: ${client.notes || "—"}`,
  ].join("\n");
}
