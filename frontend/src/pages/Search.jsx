import { useState } from "react";
import { semanticSearch } from "../api/search";
import MatchGauge from "../components/MatchGauge";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchedFor, setSearchedFor] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await semanticSearch(query.trim());
      setResults(res.data.results);
      setSearchedFor(res.data.query);
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Knowledge base</span>
          <h1>Semantic search</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="search-box">
        <input
          type="text"
          placeholder="Ask something the knowledge base might know..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="error-text">{error}</div>}

      {results === null ? (
        <div className="empty-state">
          <h3>Search across every uploaded document</h3>
          <p>Results are ranked by semantic similarity, not just keyword matches.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <h3>No matches for "{searchedFor}"</h3>
          <p>Try a different phrase, or check that documents have been uploaded.</p>
        </div>
      ) : (
        results.map((r, i) => (
          <div className="index-card" key={i}>
            <div>
              <div className="index-card-text">{r.chunk_text}</div>
              <div className="index-card-source">Document #{r.document_id}</div>
            </div>
            <MatchGauge score={r.score} />
          </div>
        ))
      )}
    </div>
  );
}
