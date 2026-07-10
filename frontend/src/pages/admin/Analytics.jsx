import { useEffect, useState } from "react";
import { getAnalytics } from "../../api/analytics";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load analytics."));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Analytics</h1>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{data.total_tasks}</div>
              <div className="stat-label">Total tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.completed_tasks}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.pending_tasks}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="card">
            <h2>Most searched queries</h2>
            {data.most_searched_queries.length === 0 ? (
              <div className="empty-state">
                <h3>No searches logged yet</h3>
                <p>Once users start searching, the most common queries show up here.</p>
              </div>
            ) : (
              data.most_searched_queries.map((q, i) => (
                <div className="query-row" key={i}>
                  <span>{q.query}</span>
                  <span className="query-count">{q.count}×</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
