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

    setInsight(
      client.aiInsight ||
        ""
    );

    setDraft("");

    setDraftError("");

    setInsightError("");

  }, [client.id]);


  // ==========================================
  // CLIENT AGE
  // ==========================================

  const days =
    daysSince(
      client.lastContactDate
    );


  // ==========================================
  // UPDATE FIELD
  // ==========================================

  function field(
    key,
    value
  ) {
    const updated = {
      ...form,
      [key]: value,
    };

    setForm(updated);

    onUpdate(updated);
  }


  // ==========================================
  // ADD ACTIVITY
  // ==========================================

  function addActivity() {
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
      ...form,

      activityLog: [
        entry,

        ...(form.activityLog ||
          []),
      ],

      lastContactDate:
        isoDate(
          new Date()
        ),
    };

    setForm(updated);

    onUpdate(updated);

    setNewActivity({
      type: "Email",
      note: "",
    });
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
        ...form,

        aiInsight:
          text,
      };

      setForm(updated);

      onUpdate(updated);

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
      onClick={onClose}
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
            onClick={onClose}
          >
            <ArrowLeft
              size={16}
            />

            Back
          </button>

          <div className="drawer-head-actions">

            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                onLogContact(
                  client.id
                )
              }
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
            Details
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

            AI Assistant
          </button>

        </div>


        {/* ======================================
            DETAILS
        ====================================== */}

        {tab ===
          "details" && (
          <div className="tab-panel">

            <div className="form-grid">

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

          </div>
        )}


        {/* ======================================
            ACTIVITY
        ====================================== */}

        {tab ===
          "activity" && (
          <div className="tab-panel">

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


            <div className="activity-list">

              {(
                form.activityLog ||
                []
              ).length ===
                0 && (
                <div className="empty-state small">
                  No activity logged yet.
                </div>
              )}


              {(
                form.activityLog ||
                []
              ).map((activity) => (

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