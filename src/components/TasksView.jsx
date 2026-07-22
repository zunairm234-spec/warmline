import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Circle,
  Edit3,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { formatDate, isoDate } from "../lib/helpers";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

const PRIORITIES = ["high", "medium", "low"];

function taskMatchesFilter(task, filter, today) {
  if (filter === "completed") return task.status === "completed";
  if (task.status === "completed") return false;
  if (filter === "today") return task.dueDate === today;
  if (filter === "upcoming") return Boolean(task.dueDate && task.dueDate > today);
  if (filter === "overdue") return Boolean(task.dueDate && task.dueDate < today);
  return true;
}

function copyTask(task) {
  return { ...task };
}

export default function TasksView({
  tasks,
  clients,
  onCreateTask,
  onUpdateTask,
  onCompleteTask,
  onDeleteTask,
}) {
  const [filter, setFilter] = useState("all");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDueDate, setQuickDueDate] = useState("");
  const [quickError, setQuickError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editError, setEditError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  const today = isoDate(new Date());

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => taskMatchesFilter(task, filter, today))
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "completed" ? 1 : -1;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, filter, today]);

  async function handleQuickCreate(event) {
    event.preventDefault();
    setQuickError("");

    if (!quickTitle.trim()) {
      setQuickError("Add a task title first.");
      return;
    }

    try {
      await onCreateTask({
        title: quickTitle,
        dueDate: quickDueDate || null,
        description: "",
        clientId: null,
        priority: "medium",
        source: "manual",
      });
      setQuickTitle("");
      setQuickDueDate("");
    } catch (error) {
      setQuickError(error.message || "Could not create task.");
    }
  }

  function beginEdit(task) {
    setActionError("");
    setEditError("");
    setEditingId(task.id);
    setEditDraft(copyTask(task));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setEditError("");
  }

  async function saveEdit() {
    setEditError("");
    setSaving(true);

    try {
      await onUpdateTask(editDraft);
      cancelEdit();
    } catch (error) {
      setEditError(error.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setActionError("");

    try {
      await onCompleteTask(task);
    } catch (error) {
      setActionError(error.message || "Could not update this task.");
    }
  }

  async function removeTask(task) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setActionError("");

    try {
      await onDeleteTask(task.id);
      if (editingId === task.id) cancelEdit();
    } catch (error) {
      setActionError(error.message || "Could not delete this task.");
    }
  }

  return (
    <div className="view tasks-view">
      <div className="view-header tasks-header">
        <div>
          <span className="dashboard-kicker">Workspace</span>
          <h1>Tasks</h1>
          <p className="view-sub">Keep the next commitment visible and moving.</p>
        </div>
      </div>

      <section className="panel task-quick-add">
        <div className="panel-head">
          <div>
            <h2>New task</h2>
            <span className="view-sub">Add a title now. You can add details later.</span>
          </div>
          <ListChecks size={18} />
        </div>
        <form className="quick-task-form" onSubmit={handleQuickCreate}>
          <input
            className="input"
            placeholder="What needs to get done?"
            value={quickTitle}
            onChange={(event) => setQuickTitle(event.target.value)}
          />
          <label className="task-date-input">
            <CalendarClock size={14} />
            <input
              type="date"
              value={quickDueDate}
              onChange={(event) => setQuickDueDate(event.target.value)}
              aria-label="Optional due date"
            />
          </label>
          <button className="btn btn-primary" type="submit">
            <Plus size={15} /> New Task
          </button>
        </form>
        {quickError && <p className="task-error">{quickError}</p>}
      </section>

      <div className="task-toolbar">
        <div className="task-filters" role="tablist" aria-label="Task filters">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              className={`task-filter ${filter === item.id ? "task-filter-active" : ""}`}
              onClick={() => setFilter(item.id)}
              role="tab"
              aria-selected={filter === item.id}
            >
              {item.label}
              <span>{tasks.filter((task) => taskMatchesFilter(task, item.id, today)).length}</span>
            </button>
          ))}
        </div>
      </div>

      {actionError && <div className="task-error task-action-error">{actionError}</div>}

      <section className="panel task-list-panel">
        {visibleTasks.length === 0 ? (
          <div className="empty-state task-empty">
            <ListChecks size={30} strokeWidth={1.5} />
            <p>{filter === "all" ? "No tasks yet." : `No ${FILTERS.find((item) => item.id === filter)?.label.toLowerCase()} tasks.`}</p>
          </div>
        ) : (
          <div className="task-list">
            {visibleTasks.map((task) => {
              const overdue = task.status === "open" && task.dueDate && task.dueDate < today;
              const linkedClient = clients.find((client) => client.id === task.clientId);
              const isEditing = editingId === task.id;

              return (
                <article className={`task-row ${task.status === "completed" ? "task-row-completed" : ""}`} key={task.id}>
                  <button className="task-complete-button" onClick={() => toggleTask(task)} aria-label={task.status === "completed" ? "Reopen task" : "Complete task"}>
                    {task.status === "completed" ? <Check size={15} /> : <Circle size={17} />}
                  </button>

                  {isEditing ? (
                    <div className="task-edit-form">
                      <input
                        className="input"
                        value={editDraft.title}
                        onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })}
                      />
                      <textarea
                        className="textarea"
                        rows={2}
                        placeholder="Description (optional)"
                        value={editDraft.description || ""}
                        onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })}
                      />
                      <div className="task-edit-grid">
                        <select className="select" value={editDraft.priority} onChange={(event) => setEditDraft({ ...editDraft, priority: event.target.value })}>
                          {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority[0].toUpperCase() + priority.slice(1)} priority</option>)}
                        </select>
                        <select className="select" value={editDraft.clientId || ""} onChange={(event) => setEditDraft({ ...editDraft, clientId: event.target.value || null })}>
                          <option value="">No linked client</option>
                          {clients.map((client) => <option key={client.id} value={client.id}>{client.name || "Unnamed client"}</option>)}
                        </select>
                        <input className="input" type="date" value={editDraft.dueDate || ""} onChange={(event) => setEditDraft({ ...editDraft, dueDate: event.target.value || null })} />
                      </div>
                      {editError && <p className="task-error">{editError}</p>}
                      <div className="task-edit-actions">
                        <button className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={saving}><X size={13} /> Cancel</button>
                        <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}><Check size={13} /> {saving ? "Saving..." : "Save Changes"}</button>
                      </div>
                    </div>
                  ) : (
                    <button className="task-content" onClick={() => beginEdit(task)}>
                      <div className="task-title-line">
                        <strong>{task.title}</strong>
                        {task.source !== "manual" && <span className="task-source">{task.source}</span>}
                      </div>
                      {task.description && <span className="task-description">{task.description}</span>}
                      <span className="task-linked-client">{linkedClient ? linkedClient.name : "Standalone task"}</span>
                    </button>
                  )}

                  {!isEditing && (
                    <div className="task-meta">
                      <span className={`task-priority task-priority-${task.priority}`}>{task.priority}</span>
                      <span className={overdue ? "task-due task-due-overdue" : "task-due"}>{task.dueDate ? formatDate(task.dueDate) : "No due date"}</span>
                      <button className="icon-btn" onClick={() => beginEdit(task)} title="Edit task"><Edit3 size={14} /></button>
                      <button className="icon-btn task-delete" onClick={() => removeTask(task)} title="Delete task"><Trash2 size={14} /></button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
