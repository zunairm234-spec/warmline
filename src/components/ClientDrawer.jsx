import { useEffect, useState } from "react";

import {
  Sparkles,
  Mail,
  MessageCircle,
  Linkedin,
  Phone,
  Trash2,
  Clock,
  Check,
  Copy,
  RefreshCw,
  AlertCircle,
  Building2,
  Tag,
  DollarSign,
  Globe,
  MapPin,
  StickyNote,
  ArrowLeft,
  CalendarClock,
  Pencil,
  X,
  Users,
} from "lucide-react";

import ColdClock from "./ui/ColdClock";

import {
  StagePill,
  PriorityPill,
  HeatPill,
} from "./ui/Badges";

import {
  daysSince,
  isoDate,
  formatDate,
  uid,
  money,
} from "../lib/helpers";

import {
  STAGES,
  PRIORITIES,
  CHANNELS,
} from "../lib/constants";

import {
  callAI,
  buildFollowUpPrompt,
  buildInsightPrompt,
} from "../lib/ai";

const CHANNEL_ICONS = {
  email: Mail,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
};

const EDITABLE_FIELDS = [
  "name",
  "company",
  "industry",
  "email",
  "phone",
  "whatsapp",
  "linkedin",
  "address",
  "leadSource",
  "dealValue",
  "priority",
  "stage",
  "nextFollowUpDate",
  "notes",
  "tags",
];

function copyClientDraft(client) {
  return {
    ...client,
    tags: [...(client.tags || [])],
  };
}

function getEditableSnapshot(client) {
  return EDITABLE_FIELDS.reduce((snapshot, key) => {
    snapshot[key] = client[key];
    return snapshot;
  }, {});
}

export default function ClientDrawer({
  client,
  initialTab,
  aiSettings,
  onClose,
  onUpdate,
  onDelete,
  onLogContact,
}) {
  const [tab, setTab] =
    useState(
      initialTab ||
        "details"
    );

  const [form, setForm] =
    useState(client);

  const [isEditing, setIsEditing] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const [newActivity, setNewActivity] =
    useState({
      type: "Email",
      note: "",
    });

  const [channel, setChannel] =
    useState("email");

  const [draft, setDraft] =
    useState("");

  const [draftLoading, setDraftLoading] =
    useState(false);

  const [draftError, setDraftError] =
    useState("");

  const [insight, setInsight] =
    useState(
      client.aiInsight ||
        ""
    );

  const [insightLoading, setInsightLoading] =
    useState(false);

  const [insightError, setInsightError] =
    useState("");

  const [copied, setCopied] =
    useState(false);


  // ==========================================
  // SYNC CLIENT
  // ==========================================

  useEffect(() => {
    setForm(client);
    setIsEditing(false);
    setSaveError("");

    setInsight(
      client.aiInsight ||
        ""
    );

    setDraft("");

    setDraftError("");

    setInsightError("");

  }, [client.id]);

  const hasUnsavedChanges =
    isEditing &&
    JSON.stringify(getEditableSnapshot(form)) !==
      JSON.stringify(getEditableSnapshot(client));


  // ==========================================
  // CLIENT AGE
  // ==========================================

  const days =
    daysSince(
      client.lastContactDate
    );

  const today =
    isoDate(
      new Date()
    );

  const followUpOverdue =
    form.nextFollowUpDate &&
    form.nextFollowUpDate <= today;

  const overviewFields = [
    ["Full name", form.name],
    ["Company", form.company],
    ["Industry", form.industry],
    ["Email", form.email],
    ["Phone", form.phone],
    ["Website", form.website],
    ["Lead source", form.leadSource],
    ["Created", form.createdAt ? formatDate(form.createdAt.slice(0, 10)) : ""],
    ["Last contact", form.lastContactDate ? formatDate(form.lastContactDate) : ""],
    ["Next follow-up", form.nextFollowUpDate ? formatDate(form.nextFollowUpDate) : ""],
  ].filter(([, value]) => value);


  // ==========================================
  // UPDATE FIELD
  // ==========================================

  function field(
    key,
    value
  ) {
    if (!isEditing) {
      return;
    }

    const updated = {
      ...form,
      [key]: value,
    };

    setForm(updated);
    setSaveError("");
  }

  function startEditing() {
    setForm(copyClientDraft(client));
    setSaveError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    if (hasUnsavedChanges && !window.confirm("Discard your unsaved changes?")) {
      return;
    }

    setForm(copyClientDraft(client));
    setSaveError("");
    setIsEditing(false);
  }

  async function saveChanges() {
    setSaveError("");

    try {
      const savedClient = await onUpdate(form);

      setForm(copyClientDraft(savedClient || form));
      setIsEditing(false);
    } catch (error) {
      setSaveError(
        error.message ||
          "Could not save changes. Please try again."
      );
    }
  }

  function requestClose() {
    if (
      hasUnsavedChanges &&
      !window.confirm("Discard your unsaved changes and close this client?")
    ) {
      return;
    }

    onClose();
  }

  async function logContactToday() {
    setSaveError("");

    try {
      const savedClient = await onLogContact(client.id);

      if (savedClient) {
        setForm((current) => ({
          ...current,
          activityLog: savedClient.activityLog,
          lastContactDate: savedClient.lastContactDate,
        }));
      }
    } catch (error) {
      setSaveError(
        error.message ||
          "Could not log contact today. Please try again."
      );
    }
  }


  // ==========================================
  // ADD ACTIVITY
  // ==========================================

  async function addActivity() {
    if (
      !newActivity.note.trim()
    ) {
      return;
    }

    const entry = {
      id: uid(),

      date: isoDate(
        new Date()
      ),

      type:
        newActivity.type,

      note:
        newActivity.note.trim(),
    };

    const updated = {
      ...client,

      activityLog: [
        entry,

        ...(client.activityLog ||
          []),
      ],

      lastContactDate:
        isoDate(
          new Date()
        ),
    };

    try {
      const savedClient = await onUpdate(updated);

      setForm((current) => ({
        ...current,
        aiInsight: (savedClient || updated).aiInsight,
      }));

      setNewActivity({
        type: "Email",
        note: "",
      });
    } catch (error) {
      setSaveError(
        error.message ||
          "Could not log this activity. Please try again."
      );
    }
  }


  // ==========================================
  // GENERATE AI FOLLOW-UP
  // ==========================================

  async function generateDraft() {
    setDraftLoading(true);

    setDraftError("");

    try {
      const prompt =
        buildFollowUpPrompt(
          client,
          channel
        );

      const text =
        await callAI(
          prompt,
          aiSettings
        );

      setDraft(text);

    } catch (error) {
      console.error(
        "AI draft error:",
        error
      );

      setDraftError(
        error.message ||
          "Something went wrong generating this draft."
      );

    } finally {
      setDraftLoading(false);
    }
  }


  // ==========================================
  // GENERATE AI INSIGHT
  // ==========================================

  async function generateInsight() {
    setInsightLoading(true);

    setInsightError("");

    try {
      const prompt =
        buildInsightPrompt(
          client
        );

      const text =
        await callAI(
          prompt,
          aiSettings
        );

      setInsight(text);

      const updated = {
        ...client,

        aiInsight:
          text,
      };

      const savedClient = await onUpdate(updated);

      setForm((current) => ({
        ...current,
        activityLog: (savedClient || updated).activityLog,
        lastContactDate: (savedClient || updated).lastContactDate,
      }));

    } catch (error) {
      console.error(
        "AI insight error:",
        error
      );

      setInsightError(
        error.message ||
          "Something went wrong generating this insight."
      );

    } finally {
      setInsightLoading(false);
    }
  }


  // ==========================================
  // COPY AI DRAFT
  // ==========================================

  function copyDraft() {
    if (!draft) {
      return;
    }

    navigator.clipboard
      ?.writeText(draft)
      .then(() => {
        setCopied(true);

        setTimeout(
          () =>
            setCopied(false),
          1500
        );
      });
  }


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="drawer-overlay"
      onClick={requestClose}
    >
      <div
        className="drawer"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="drawer-head">

          <button
            className="btn btn-ghost btn-sm"
            onClick={requestClose}
          >
            <ArrowLeft
              size={16}
            />

            Back
          </button>

          <div className="drawer-head-actions">

            {isEditing ? (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={cancelEditing}
                >
                  <X size={14} />
                  Cancel
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={saveChanges}
                >
                  <Check size={14} />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                onClick={startEditing}
              >
                <Pencil size={14} />
                Edit
              </button>
            )}

            <button
              className="btn btn-ghost btn-sm"
              onClick={logContactToday}
            >
              <Clock
                size={14}
              />

              Log contact today
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() =>
                onDelete(
                  client.id
                )
              }
            >
              <Trash2
                size={14}
              />
            </button>

          </div>

        </div>


        {/* CLIENT TITLE */}

        <div className="drawer-title-row">

          <ColdClock
            days={days}
            size={56}
          />

          <div>

            <h2>
              {form.name}
            </h2>

            <div className="drawer-sub">

              {
                form.company ||
                "No company"
              }

              {" "}

              {form.industry
                ? `· ${form.industry}`
                : ""}

            </div>

            <div className="drawer-pills">

              <StagePill
                stage={
                  form.stage
                }
              />

              <PriorityPill
                priority={
                  form.priority
                }
              />

              <HeatPill
                days={days}
              />

            </div>

            <div className="drawer-deal-summary">
              {form.dealValue > 0 && (
                <span>
                  {money(form.dealValue)} deal
                </span>
              )}

              {form.leadSource && (
                <span>
                  From {form.leadSource}
                </span>
              )}
            </div>

          </div>

        </div>


        {/* TABS */}

        <div className="tabs">

          <button
            className={`tab-btn ${
              tab ===
              "details"
                ? "tab-active"
                : ""
            }`}
            onClick={() =>
              setTab(
                "details"
              )
            }
          >
            Overview
          </button>

          <button
            className={`tab-btn ${
              tab ===
              "activity"
                ? "tab-active"
                : ""
            }`}
            onClick={() =>
              setTab(
                "activity"
              )
            }
          >
            Activity
          </button>

          <button
            className={`tab-btn ${
              tab === "ai"
                ? "tab-active"
                : ""
            }`}
            onClick={() =>
              setTab("ai")
            }
          >
            <Sparkles
              size={13}
            />

            AI & Follow-up
          </button>

        </div>

        {saveError && (
          <div className="drawer-save-error">
            <AlertCircle size={14} />
            {saveError}
          </div>
        )}


        {/* ======================================
            DETAILS
        ====================================== */}

        {tab ===
          "details" && (
          <div className="tab-panel">

            <section className="workspace-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Client 360</span>
                  <h3>Overview</h3>
                </div>
                <span className="section-caption">Current relationship snapshot</span>
              </div>

              <div className="overview-grid">
                {overviewFields.map(([label, value]) => (
                  <div className="overview-item" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="workspace-section sales-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Sales</span>
                  <h3>Deal information</h3>
                </div>
                <DollarSign size={16} />
              </div>

              <div className="sales-summary">
                <div>
                  <span>Deal value</span>
                  <strong>{money(form.dealValue)}</strong>
                </div>
                <div>
                  <span>Stage</span>
                  <StagePill stage={form.stage} />
                </div>
                <div>
                  <span>Priority</span>
                  <PriorityPill priority={form.priority} />
                </div>
              </div>

              <div className="stage-track" aria-label="Pipeline stage">
                {STAGES.map((stage) => (
                  <span
                    key={stage}
                    className={STAGES.indexOf(form.stage) >= STAGES.indexOf(stage) ? "stage-complete" : ""}
                  />
                ))}
              </div>
            </section>

            <section className="workspace-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Follow-up status</span>
                  <h3>Relationship timing</h3>
                </div>
                {followUpOverdue && <span className="overdue-label">Overdue</span>}
              </div>

              <div className="follow-up-summary">
                <div>
                  <span>Last contacted</span>
                  <strong>{form.lastContactDate ? formatDate(form.lastContactDate) : "Not provided"}</strong>
                </div>
                <div>
                  <span>Days since contact</span>
                  <strong>{form.lastContactDate ? days : "Not provided"}</strong>
                </div>
                <div>
                  <span>Next follow-up</span>
                  <strong className={followUpOverdue ? "text-overdue" : ""}>
                    {form.nextFollowUpDate ? formatDate(form.nextFollowUpDate) : "Not scheduled"}
                  </strong>
                </div>
              </div>
            </section>

            <div className="section-divider" />

            <div className="section-heading edit-heading">
              <div>
                <span className="section-kicker">Edit</span>
                <h3>Client details</h3>
              </div>
              <span className="section-caption">
                {isEditing ? "Edit the draft, then save" : "Read-only until you edit"}
              </span>
            </div>

            <fieldset
              className="drawer-edit-fields"
              disabled={!isEditing}
            >
            <div className="form-grid">

              <label className="field">
                <span>
                  <Users size={12} />
                  Name
                </span>

                <input
                  className="input"
                  value={form.name || ""}
                  onChange={(e) =>
                    field("name", e.target.value)
                  }
                />
              </label>

              <label className="field">
                <span>
                  <Building2
                    size={12}
                  />

                  Company
                </span>

                <input
                  className="input"
                  value={
                    form.company ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "company",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>
                  <Tag size={12} />
                  Industry
                </span>

                <input
                  className="input"
                  value={form.industry || ""}
                  onChange={(e) =>
                    field("industry", e.target.value)
                  }
                />
              </label>


              <label className="field">
                <span>
                  <Globe
                    size={12}
                  />

                  Website
                </span>

                <input
                  className="input"
                  value={
                    form.website ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "website",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="field">
                <span>
                  <Mail
                    size={12}
                  />

                  Email
                </span>

                <input
                  className="input"
                  value={
                    form.email ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "email",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="field">
                <span>
                  <Phone
                    size={12}
                  />

                  Phone
                </span>

                <input
                  className="input"
                  value={
                    form.phone ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "phone",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="field">
                <span>
                  <MessageCircle
                    size={12}
                  />

                  WhatsApp
                </span>

                <input
                  className="input"
                  value={
                    form.whatsapp ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "whatsapp",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="field">
                <span>
                  <Linkedin
                    size={12}
                  />

                  LinkedIn
                </span>

                <input
                  className="input"
                  value={
                    form.linkedin ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "linkedin",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="field">
                <span>
                  <MapPin
                    size={12}
                  />

                  Address
                </span>

                <input
                  className="input"
                  value={
                    form.address ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "address",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="field">
                <span>
                  <Tag
                    size={12}
                  />

                  Lead source
                </span>

                <input
                  className="input"
                  value={
                    form.leadSource ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "leadSource",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="field">
                <span>
                  <DollarSign
                    size={12}
                  />

                  Deal value
                </span>

                <input
                  className="input"
                  type="number"
                  value={
                    form.dealValue ||
                    0
                  }
                  onChange={(e) =>
                    field(
                      "dealValue",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="field">
                <span>
                  Priority
                </span>

                <select
                  className="select"
                  value={
                    form.priority
                  }
                  onChange={(e) =>
                    field(
                      "priority",
                      e.target.value
                    )
                  }
                >
                  {PRIORITIES.map(
                    (priority) => (
                      <option
                        key={
                          priority
                        }
                      >
                        {
                          priority
                        }
                      </option>
                    )
                  )}
                </select>
              </label>


              <label className="field">
                <span>
                  Stage
                </span>

                <select
                  className="select"
                  value={
                    form.stage
                  }
                  onChange={(e) =>
                    field(
                      "stage",
                      e.target.value
                    )
                  }
                >
                  {STAGES.map(
                    (stage) => (
                      <option
                        key={
                          stage
                        }
                      >
                        {stage}
                      </option>
                    )
                  )}
                </select>
              </label>


              <label className="field">
                <span>
                  <CalendarClock
                    size={12}
                  />

                  Next follow-up
                </span>

                <input
                  className="input"
                  type="date"
                  value={
                    form.nextFollowUpDate ||
                    ""
                  }
                  onChange={(e) =>
                    field(
                      "nextFollowUpDate",
                      e.target.value
                    )
                  }
                />
              </label>

            </div>


            <div className="section-divider" />

            <div className="section-heading edit-heading">
              <div>
                <span className="section-kicker">Context</span>
                <h3>Notes</h3>
              </div>
              <StickyNote size={16} />
            </div>

            <label className="field field-full">

              <span>
                <StickyNote
                  size={12}
                />

                Notes
              </span>

              <textarea
                className="textarea"
                rows={4}
                value={
                  form.notes ||
                  ""
                }
                onChange={(e) =>
                  field(
                    "notes",
                    e.target.value
                  )
                }
              />

            </label>


            <label className="field field-full">

              <span>
                <Tag
                  size={12}
                />

                Tags (comma separated)
              </span>

              <input
                className="input"
                value={(
                  form.tags ||
                  []
                ).join(", ")}
                onChange={(e) =>
                  field(
                    "tags",
                    e.target.value
                      .split(",")
                      .map(
                        (tag) =>
                          tag.trim()
                      )
                      .filter(
                        Boolean
                      )
                  )
                }
              />

            </label>

            </fieldset>

          </div>
        )}


        {/* ======================================
            ACTIVITY
        ====================================== */}

        {tab ===
          "activity" && (
          <div className="tab-panel">

            <div className="section-heading">
              <div>
                <span className="section-kicker">History</span>
                <h3>Activity timeline</h3>
              </div>
              <span className="section-caption">
                {(form.activityLog || []).length} logged
              </span>
            </div>

            <div className="activity-add">

              <select
                className="select"
                value={
                  newActivity.type
                }
                onChange={(e) =>
                  setNewActivity(
                    (activity) => ({
                      ...activity,
                      type:
                        e.target.value,
                    })
                  )
                }
              >
                <option>
                  Email
                </option>

                <option>
                  Call
                </option>

                <option>
                  WhatsApp
                </option>

                <option>
                  LinkedIn
                </option>

                <option>
                  Meeting
                </option>

                <option>
                  Note
                </option>
              </select>


              <input
                className="input"
                placeholder="What happened?"
                value={
                  newActivity.note
                }
                onChange={(e) =>
                  setNewActivity(
                    (activity) => ({
                      ...activity,
                      note:
                        e.target.value,
                    })
                  )
                }
                onKeyDown={(e) =>
                  e.key ===
                    "Enter" &&
                  addActivity()
                }
              />


              <button
                className="btn btn-primary btn-sm"
                onClick={
                  addActivity
                }
              >
                Log
              </button>

            </div>


            <div className="activity-list activity-timeline">

              {(
                form.activityLog ||
                []
              ).length ===
                0 && (
                <div className="empty-state small">
                  No activity logged yet.
                </div>
              )}


              {[
                ...(form.activityLog || []),
              ]
                .sort((a, b) =>
                  String(b.date || "").localeCompare(
                    String(a.date || "")
                  )
                )
                .map((activity) => (

                <div
                  className="activity-row"
                  key={
                    activity.id
                  }
                >

                  <span className="pill stage-default">
                    {
                      activity.type
                    }
                  </span>

                  <div className="activity-note">
                    {
                      activity.note
                    }
                  </div>

                  <div className="activity-date mono">
                    {formatDate(
                      activity.date
                    )}
                  </div>

                </div>

                ))}

            </div>

          </div>
        )}


        {/* ======================================
            AI ASSISTANT
        ====================================== */}

        {tab === "ai" && (
          <div className="tab-panel">

            <div className="section-heading ai-workspace-heading">
              <div>
                <span className="section-kicker">Workspace</span>
                <h3>AI insights and next action</h3>
              </div>
              <Sparkles size={17} />
            </div>

            {/* PRIORITY INSIGHT */}

            <div className="ai-block">

              <div className="ai-block-head">

                <span>
                  <Sparkles
                    size={14}
                  />

                  Priority insight
                </span>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={
                    generateInsight
                  }
                  disabled={
                    insightLoading
                  }
                >
                  <RefreshCw
                    size={13}
                    className={
                      insightLoading
                        ? "spin"
                        : ""
                    }
                  />

                  {insight
                    ? "Regenerate"
                    : "Generate"}
                </button>

              </div>


              {insightError && (
                <div className="ai-error">

                  <AlertCircle
                    size={13}
                  />

                  {
                    insightError
                  }

                </div>
              )}


              {insight ? (

                <p className="ai-insight-text">
                  {insight}
                </p>

              ) : (

                !insightLoading && (
                  <p className="ai-placeholder">
                    No insight yet — click generate.
                  </p>
                )

              )}


              {insightLoading && (
                <p className="ai-placeholder">
                  Thinking…
                </p>
              )}

            </div>


            {/* FOLLOW-UP DRAFT */}

            <div className="ai-block">

              <div className="ai-block-head">

                <span>
                  <Mail
                    size={14}
                  />

                  Draft a follow-up
                </span>

              </div>


              <div className="channel-row">

                {CHANNELS.map(
                  ({
                    id,
                    label,
                  }) => {

                    const Icon =
                      CHANNEL_ICONS[
                        id
                      ];

                    return (

                      <button
                        key={id}
                        className={`channel-btn ${
                          channel ===
                          id
                            ? "channel-active"
                            : ""
                        }`}
                        onClick={() =>
                          setChannel(
                            id
                          )
                        }
                      >

                        <Icon
                          size={14}
                        />

                        {label}

                      </button>

                    );

                  }
                )}

              </div>


              <button
                className="btn btn-primary"
                onClick={
                  generateDraft
                }
                disabled={
                  draftLoading
                }
                style={{
                  marginTop: 10,
                }}
              >

                <Sparkles
                  size={14}
                />

                {draftLoading
                  ? "Writing…"
                  : draft
                  ? "Regenerate draft"
                  : "Generate draft"}

              </button>


              {draftError && (
                <div className="ai-error">

                  <AlertCircle
                    size={13}
                  />

                  {
                    draftError
                  }

                </div>
              )}


              {draft && (
                <>

                  <textarea
                    className="textarea draft-textarea"
                    rows={8}
                    value={draft}
                    onChange={(e) =>
                      setDraft(
                        e.target.value
                      )
                    }
                  />


                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={
                      copyDraft
                    }
                  >

                    {copied ? (
                      <Check
                        size={13}
                      />
                    ) : (
                      <Copy
                        size={13}
                      />
                    )}

                    {copied
                      ? "Copied"
                      : "Copy to clipboard"}

                  </button>


                  <p className="ai-note">

                    This drafts the message for you — sending isn't wired up yet, so copy it into{" "}

                    {
                      channel ===
                      "email"
                        ? "your email client"
                        : channel ===
                          "whatsapp"
                        ? "WhatsApp"
                        : "LinkedIn"
                    }.

                  </p>

                </>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}