import { useState } from "react";
import { X, KeyRound, ExternalLink } from "lucide-react";

export default function SettingsModal({ currentKey, onClose, onSave }) {
  const [key, setKey] = useState(currentKey || "");

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Settings</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <label className="field field-full">
          <span>
            <KeyRound size={12} /> Anthropic API key
          </span>
          <input
            className="input"
            type="password"
            placeholder="sk-ant-..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
        </label>

        <p className="ai-note" style={{ marginBottom: 14 }}>
          Needed for the AI draft &amp; insight features. Stored only in this browser's local storage —
          it's sent directly from your browser to Anthropic's API, never through any server of ours.
          Get a key at{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
            console.anthropic.com <ExternalLink size={10} style={{ display: "inline" }} />
          </a>
          .
        </p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onSave(key.trim());
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
