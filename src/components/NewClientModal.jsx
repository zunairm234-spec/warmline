import { useState } from "react";
import { X } from "lucide-react";
import { uid, isoDate } from "../lib/helpers";
import { PRIORITIES } from "../lib/constants";

export default function NewClientModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [priority, setPriority] = useState("Medium");

  function submit() {
    if (!name.trim()) return;
    onCreate({
      id: uid(),
      name: name.trim(),
      company,
      email,
      dealValue: Number(dealValue) || 0,
      priority,
      stage: "New Lead",
      website: "",
      industry: "",
      phone: "",
      whatsapp: "",
      linkedin: "",
      address: "",
      notes: "",
      tags: [],
      leadSource: "",
      lastContactDate: isoDate(new Date()),
      nextFollowUpDate: "",
      activityLog: [],
      aiInsight: "",
      createdAt: isoDate(new Date()),
    });
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>New client</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <label className="field field-full">
          <span>Name *</span>
          <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </label>
        <label className="field field-full">
          <span>Company</span>
          <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label className="field field-full">
          <span>Email</span>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <div className="form-grid">
          <label className="field">
            <span>Deal value</span>
            <input className="input" type="number" value={dealValue} onChange={(e) => setDealValue(e.target.value)} />
          </label>
          <label className="field">
            <span>Priority</span>
            <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={!name.trim()}>
            Add client
          </button>
        </div>
      </div>
    </div>
  );
}
