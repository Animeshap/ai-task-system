import { useEffect, useState } from "react";
import { listTasks, updateTaskStatus } from "../../api/tasks";
import StatusPill from "../../components/StatusPill";

export default function UserTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await listTasks({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setTasks(res.data);
    } catch {
      setError("Couldn't load your tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function toggleStatus(task) {
    const nextStatus = task.status === "pending" ? "completed" : "pending";
    setUpdatingId(task.id);
    try {
      await updateTaskStatus(task.id, nextStatus);
      await loadTasks();
    } catch {
      setError("Couldn't update task status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Your work</span>
          <h1>My tasks</h1>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

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
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing here</h3>
            <p>No tasks match this filter right now.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div className="task-row" key={task.id}>
              <div className="task-main">
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
                <div className="task-meta">
                  #{task.id} · created {new Date(task.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="task-actions">
                <StatusPill status={task.status} />
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={updatingId === task.id}
                  onClick={() => toggleStatus(task)}
                >
                  {updatingId === task.id
                    ? "Updating..."
                    : task.status === "pending"
                    ? "Mark completed"
                    : "Reopen"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
