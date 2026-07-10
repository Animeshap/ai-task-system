import { useEffect, useState } from "react";
import { listTasks, createTask } from "../../api/tasks";
import StatusPill from "../../components/StatusPill";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedToFilter, setAssignedToFilter] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await listTasks({
        status: statusFilter === "all" ? undefined : statusFilter,
        assignedTo: assignedToFilter || undefined,
      });
      setTasks(res.data);
    } catch {
      setError("Couldn't load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, assignedToFilter]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createTask({
        title,
        description,
        assigned_to: Number(assignedTo),
      });
      setSuccess(`Task "${title}" assigned to user #${assignedTo}.`);
      setTitle("");
      setDescription("");
      setAssignedTo("");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't create task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Task management</span>
          <h1>Assign &amp; track tasks</h1>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-text">{success}</div>}

      <div className="card">
        <h2>New task</h2>
        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="assignedTo">Assign to (user ID)</label>
              <input
                id="assignedTo"
                type="number"
                min="1"
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details for the assignee"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? "Creating..." : "Create & assign task"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className="page-header">
          <h2 style={{ margin: 0 }}>All tasks</h2>
        </div>

        <div className="filter-bar">
          {["all", "pending", "completed"].map((s) => (
            <button
              key={s}
              className={`filter-chip${statusFilter === s ? " active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
          <input
            className="filter-chip"
            style={{ cursor: "text", width: 160 }}
            placeholder="Filter by user ID"
            type="number"
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
          />
        </div>

        <div className="card">
          {loading ? (
            <p>Loading...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks match this filter</h3>
            </div>
          ) : (
            tasks.map((task) => (
              <div className="task-row" key={task.id}>
                <div className="task-main">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta">
                    #{task.id} · assigned to user #{task.assigned_to} · created{" "}
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="task-actions">
                  <StatusPill status={task.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
