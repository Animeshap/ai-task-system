import { useEffect, useState, useRef } from "react";
import { listDocuments, uploadDocument } from "../../api/documents";

export default function UploadDocs() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  async function loadDocuments() {
    setLoading(true);
    try {
      const res = await listDocuments();
      setDocuments(res.data);
    } catch {
      setError("Couldn't load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".txt")) {
      setError("Only .txt files are supported.");
      return;
    }
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      await uploadDocument(file);
      setSuccess(`"${file.name}" uploaded and indexed.`);
      await loadDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Knowledge base</span>
          <h1>Documents</h1>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-text">{success}</div>}

      <div
        className={`file-drop${dragging ? " dragging" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <h3>{uploading ? "Uploading & indexing..." : "Drop a .txt file here"}</h3>
        <p style={{ margin: 0 }}>or click to browse — it'll be chunked and embedded automatically</p>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>Uploaded documents</h2>
        {loading ? (
          <p>Loading...</p>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <h3>No documents yet</h3>
            <p>Upload a .txt file above to start building the knowledge base.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div className="doc-row" key={doc.id}>
              <div>
                <div className="doc-title">{doc.title}</div>
                <div className="doc-meta">
                  #{doc.id} · uploaded {new Date(doc.uploaded_at).toLocaleString()}
                </div>
              </div>
              <span className="indexed-badge">
                {doc.embedding_indexed ? "Indexed" : "Not indexed"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
