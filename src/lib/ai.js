import { daysSince } from "./helpers";

/**
 * ============================================================
 * WARMline AI SERVICE
 * ============================================================
 *
 * Supported providers:
 *
 * 1. Google Gemini
 * 2. Anthropic Claude
 * 3. OpenAI
 *
 * Warmline uses one universal function:
 *
 *   callAI(prompt, settings)
 *
 * The settings object should contain:
 *
 * {
 *   provider: "gemini",
 *   model: "gemini-2.0-flash",
 *   apiKey: "YOUR_API_KEY"
 * }
 *
 * This means ClientDrawer does not need to know
 * which AI provider is being used.
 *
 * IMPORTANT:
 * Direct browser API calls expose the user's API
 * key to the browser/network.
 *
 * This is acceptable for personal development,
 * but for a public SaaS application you should
 * move these calls to a secure backend or
 * Supabase Edge Function.
 *
 * ============================================================
 */


/**
 * ============================================================
 * MAIN AI FUNCTION
 * ============================================================
 */

export async function callAI(
  prompt,
  settings
) {
  if (!prompt) {
    throw new Error(
      "AI prompt cannot be empty."
    );
  }

  if (!settings) {
    throw new Error(
      "AI settings are missing. Open Settings and configure your AI provider."
    );
  }

  const provider =
    settings.provider;

  const model =
    settings.model;

  const apiKey =
    settings.apiKey;

  if (!provider) {
    throw new Error(
      "Select an AI provider in Settings."
    );
  }

  if (!model) {
    throw new Error(
      "Select an AI model in Settings."
    );
  }

  if (!apiKey) {
    throw new Error(
      "Add your AI API key in Settings to use AI features."
    );
  }


  // ==========================================
  // GOOGLE GEMINI
  // ==========================================

  if (
    provider === "gemini"
  ) {
    return callGemini(
      prompt,
      model,
      apiKey
    );
  }


  // ==========================================
  // ANTHROPIC CLAUDE
  // ==========================================

  if (
    provider === "anthropic"
  ) {
    return callAnthropic(
      prompt,
      model,
      apiKey
    );
  }


  // ==========================================
  // OPENAI
  // ==========================================

  if (
    provider === "openai"
  ) {
    return callOpenAI(
      prompt,
      model,
      apiKey
    );
  }


  // ==========================================
  // UNKNOWN PROVIDER
  // ==========================================

  throw new Error(
    `Unsupported AI provider: ${provider}`
  );
}


/**
 * ============================================================
 * GOOGLE GEMINI
 * ============================================================
 */

async function callGemini(
  prompt,
  model,
  apiKey
) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

  const response =
    await fetch(
      url,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",

              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.7,

            maxOutputTokens: 1000,
          },
        }),
      }
    );


  if (!response.ok) {
    const body =
      await response
        .text()
        .catch(() => "");

    let message =
      body;

    try {
      const parsed =
        JSON.parse(body);

      message =
        parsed?.error?.message ||
        body;
    } catch {
      // Keep original response
    }

    throw new Error(
      `Gemini request failed (${response.status}). ${message}`
    );
  }


  const data =
    await response.json();


  const text =
    data?.candidates?.[0]
      ?.content?.parts
      ?.filter(
        (part) =>
          typeof part.text ===
          "string"
      )
      ?.map(
        (part) =>
          part.text
      )
      ?.join("\n")
      ?.trim();


  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }


  return text;
}


/**
 * ============================================================
 * ANTHROPIC CLAUDE
 * ============================================================
 */

async function callAnthropic(
  prompt,
  model,
  apiKey
) {
  const response =
    await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "x-api-key":
            apiKey,

          "anthropic-version":
            "2023-06-01",

          "anthropic-dangerous-direct-browser-access":
            "true",
        },

        body: JSON.stringify({
          model,

          max_tokens: 1000,

          messages: [
            {
              role: "user",

              content:
                prompt,
            },
          ],
        }),
      }
    );


  if (!response.ok) {
    const body =
      await response
        .text()
        .catch(() => "");

    let message =
      body;

    try {
      const parsed =
        JSON.parse(body);

      message =
        parsed?.error?.message ||
        body;
    } catch {
      // Keep original response
    }

    throw new Error(
      `Anthropic request failed (${response.status}). ${message}`
    );
  }


  const data =
    await response.json();


  const text =
    (data?.content || [])
      .filter(
        (block) =>
          block.type ===
          "text"
      )
      .map(
        (block) =>
          block.text
      )
      .join("\n")
      .trim();


  if (!text) {
    throw new Error(
      "Anthropic returned an empty response."
    );
  }


  return text;
}


/**
 * ============================================================
 * OPENAI
 * ============================================================
 */

async function callOpenAI(
  prompt,
  model,
  apiKey
) {
  const response =
    await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          model,

          messages: [
            {
              role: "user",

              content:
                prompt,
            },
          ],

          temperature: 0.7,

          max_tokens: 1000,
        }),
      }
    );


  if (!response.ok) {
    const body =
      await response
        .text()
        .catch(() => "");

    let message =
      body;

    try {
      const parsed =
        JSON.parse(body);

      message =
        parsed?.error?.message ||
        body;
    } catch {
      // Keep original response
    }

    throw new Error(
      `OpenAI request failed (${response.status}). ${message}`
    );
  }


  const data =
    await response.json();


  const text =
    data?.choices?.[0]
      ?.message?.content
      ?.trim();


  if (!text) {
    throw new Error(
      "OpenAI returned an empty response."
    );
  }


  return text;
}


/**
 * ============================================================
 * BACKWARD COMPATIBILITY
 * ============================================================
 *
 * Older parts of Warmline may still import
 * callClaude().
 *
 * This wrapper allows old code to continue
 * working temporarily.
 *
 * New code should use callAI().
 *
 * ============================================================
 */

export async function callClaude(
  prompt,
  apiKey
) {
  return callAI(
    prompt,
    {
      provider:
        "anthropic",

      model:
        "claude-3-5-haiku-latest",

      apiKey,
    }
  );
}


/**
 * ============================================================
 * FOLLOW-UP MESSAGE PROMPT
 * ============================================================
 */

export function buildFollowUpPrompt(
  client,
  channel
) {
  const days =
    daysSince(
      client.lastContactDate
    );


  const channelNote = {
    email:
      "Write it as a short email, including a one-line subject on the first line prefixed with 'Subject:', then a blank line, then the body.",

    whatsapp:
      "Write it as a short, casual WhatsApp message — no subject line, 2-4 sentences maximum.",

    linkedin:
      "Write it as a brief LinkedIn message — no subject line, warm and professional, under 80 words.",
  }[channel];


  return [
    "You are Warmline, an AI-powered CRM sales assistant.",

    "You help freelancers, agencies, small businesses, and independent professionals manage leads and clients.",

    "Create a personalized follow-up message based only on the information provided.",

    "The message should sound natural, human, professional, and relevant to the client's current stage.",

    "Do not invent facts that are not provided.",

    "Do not use placeholder brackets such as [Name].",

    "Use the real client details provided below.",

    "Do not add a preamble or explanation.",

    "Output only the final message.",

    channelNote,

    "",

    "CLIENT INFORMATION:",

    `Name: ${
      client.name ||
      "—"
    }`,

    `Company: ${
      client.company ||
      "—"
    }`,

    `Industry: ${
      client.industry ||
      "—"
    }`,

    `Current stage: ${
      client.stage ||
      "New Lead"
    }`,

    `Priority: ${
      client.priority ||
      "Medium"
    }`,

    `Days since last contact: ${
      days
    }`,

    `Notes: ${
      client.notes ||
      "—"
    }`,

    `Lead source: ${
      client.leadSource ||
      "—"
    }`,

    `Deal value: ${
      client.dealValue
        ? "$" +
          client.dealValue
        : "—"
    }`,

    `Website: ${
      client.website ||
      "—"
    }`,

    `Next follow-up date: ${
      client.nextFollowUpDate ||
      "—"
    }`,
  ].join("\n");
}


/**
 * ============================================================
 * CLIENT PRIORITY INSIGHT PROMPT
 * ============================================================
 */

export function buildInsightPrompt(
  client
) {
  const days =
    daysSince(
      client.lastContactDate
    );


  return [
    "You are Warmline, an AI-powered CRM assistant.",

    "Analyze the following lead or client and give the business owner a quick, honest recommendation about what they should do next.",

    "Focus on lead quality, urgency, relationship status, deal value, follow-up timing, and the most useful next action.",

    "Do not invent facts that are not provided.",

    "Respond with exactly 1-2 short sentences.",

    "Use plain text only.",

    "Do not use markdown.",

    "Do not add a preamble.",

    "",

    "CLIENT INFORMATION:",

    `Name: ${
      client.name ||
      "—"
    }`,

    `Company: ${
      client.company ||
      "—"
    }`,

    `Industry: ${
      client.industry ||
      "—"
    }`,

    `Stage: ${
      client.stage ||
      "New Lead"
    }`,

    `Priority: ${
      client.priority ||
      "Medium"
    }`,

    `Deal value: ${
      client.dealValue
        ? "$" +
          client.dealValue
        : "—"
    }`,

    `Days since last contact: ${
      days
    }`,

    `Notes: ${
      client.notes ||
      "—"
    }`,

    `Lead source: ${
      client.leadSource ||
      "—"
    }`,

    `Next follow-up date: ${
      client.nextFollowUpDate ||
      "—"
    }`,
  ].join("\n");
}