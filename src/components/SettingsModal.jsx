import { useEffect, useState } from "react";

import {
  X,
  KeyRound,
  ExternalLink,
  Cpu,
} from "lucide-react";

import {
  AI_PROVIDERS,
  DEFAULT_AI_SETTINGS,
  normalizeGeminiModel,
} from "../lib/constants";


export default function SettingsModal({
  currentSettings,
  onClose,
  onSave,
}) {
  const [settings, setSettings] =
    useState({
      ...DEFAULT_AI_SETTINGS,
      ...(currentSettings || {}),
    });


  // ==========================================
  // SELECTED PROVIDER
  // ==========================================

  const selectedProvider =
    AI_PROVIDERS.find(
      (provider) =>
        provider.id ===
        settings.provider
    ) ||
    AI_PROVIDERS[0];


  // ==========================================
  // CHANGE PROVIDER
  // ==========================================

  function handleProviderChange(
    providerId
  ) {
    const provider =
      AI_PROVIDERS.find(
        (item) =>
          item.id ===
          providerId
      );

    setSettings(
      (current) => ({
        ...current,

        provider:
          providerId,

        model:
          provider?.defaultModel ||
          "",
      })
    );
  }


  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  function handleSave() {
    const model =
      settings.provider === "gemini"
        ? normalizeGeminiModel(settings.model)
        : settings.model.trim();

    onSave({
      provider:
        settings.provider,

      model,

      apiKey:
        settings.apiKey.trim(),
    });

    onClose();
  }


  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="modal-head">

          <h2>
            AI Settings
          </h2>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X
              size={18}
            />
          </button>

        </div>


        {/* DESCRIPTION */}

        <p className="ai-note">
          Connect your preferred AI provider to power Warmline's AI Assistant. Each Warmline user can use their own AI provider and API key.
        </p>


        {/* PROVIDER */}

        <label className="field field-full">

          <span>
            <Cpu
              size={12}
            />

            AI Provider
          </span>

          <select
            className="select"
            value={
              settings.provider
            }
            onChange={(e) =>
              handleProviderChange(
                e.target.value
              )
            }
          >

            {AI_PROVIDERS.map(
              (provider) => (

                <option
                  key={
                    provider.id
                  }
                  value={
                    provider.id
                  }
                >
                  {
                    provider.name
                  }
                </option>

              )
            )}

          </select>

        </label>


        {/* MODEL */}

        <label className="field field-full">

          <span>
            <Cpu
              size={12}
            />

            AI Model
          </span>

          <input
            className="input"
            value={
              settings.model
            }
            onChange={(e) =>
              setSettings(
                (current) => ({
                  ...current,

                  model:
                    e.target.value,
                })
              )
            }
            placeholder={
              selectedProvider.defaultModel
            }
          />

        </label>


        {/* API KEY */}

        <label className="field field-full">

          <span>
            <KeyRound
              size={12}
            />

            {
              selectedProvider.name
            }{" "}
            API key
          </span>

          <input
            className="input"
            type="password"
            placeholder={
              selectedProvider.keyPlaceholder
            }
            value={
              settings.apiKey
            }
            onChange={(e) =>
              setSettings(
                (current) => ({
                  ...current,

                  apiKey:
                    e.target.value,
                })
              )
            }
            autoFocus
          />

        </label>


        {/* PROVIDER HELP */}

        <p
          className="ai-note"
          style={{
            marginBottom: 14,
          }}
        >

          {
            selectedProvider.helpText
          }

          {" "}

          Your API key is stored only in this browser's local storage and sent directly to the selected AI provider.

          <br />

          <br />

          <strong>
            Important:
          </strong>{" "}
          For a public production CRM, API keys should eventually be handled by a secure backend or Supabase Edge Function.

        </p>


        {/* PROVIDER LINKS */}

        {settings.provider ===
          "gemini" && (
          <p className="ai-note">

            Get your key from{" "}

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
            >
              Google AI Studio{" "}
              <ExternalLink
                size={10}
                style={{
                  display:
                    "inline",
                }}
              />
            </a>

            .

          </p>
        )}


        {settings.provider ===
          "openai" && (
          <p className="ai-note">

            Get your key from{" "}

            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
            >
              OpenAI Platform{" "}
              <ExternalLink
                size={10}
                style={{
                  display:
                    "inline",
                }}
              />
            </a>

            .

          </p>
        )}


        {settings.provider ===
          "anthropic" && (
          <p className="ai-note">

            Get your key from{" "}

            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
            >
              Anthropic Console{" "}
              <ExternalLink
                size={10}
                style={{
                  display:
                    "inline",
                }}
              />
            </a>

            .

          </p>
        )}


        {/* ACTIONS */}

        <div className="modal-actions">

          <button
            className="btn btn-ghost"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={
              handleSave
            }
          >
            Save AI Settings
          </button>

        </div>

      </div>
    </div>
  );
}