from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from app.vector_store.faiss_index import vector_store
from app.models.document import DocumentChunk

# Loaded once at import time; reused for every request.
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def chunk_text(text: str, chunk_size: int = 200, overlap: int = 50) -> list[str]:
    """Splits text into overlapping word-based chunks so semantic meaning
    isn't cut off mid-idea at chunk boundaries."""
    words = text.split()
    if not words:
        return []
    chunks = []
    step = max(chunk_size - overlap, 1)
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk:
            chunks.append(chunk)
        if i + chunk_size >= len(words):
            break
    return chunks


def index_document(document_id: int, text: str, db: Session) -> int:
    """Chunks the document, embeds each chunk, adds to FAISS, and records
    the chunk->faiss_position mapping in MySQL for traceability.
    Returns number of chunks indexed."""
    chunks = chunk_text(text)
    if not chunks:
        return 0

    model = get_model()
    vectors = model.encode(chunks, convert_to_numpy=True).astype("float32")

    meta_entries = [{"document_id": document_id, "chunk_text": c} for c in chunks]
    positions = vector_store.add(vectors, meta_entries)

    for chunk_text_value, position in zip(chunks, positions):
        db.add(
            DocumentChunk(
                document_id=document_id,
                chunk_text=chunk_text_value,
                faiss_position=position,
            )
        )
    db.commit()
    return len(chunks)


def semantic_search(query: str, k: int = 5) -> list[dict]:
    model = get_model()
    query_vector = model.encode([query], convert_to_numpy=True).astype("float32")
    return vector_store.search(query_vector, k=k)
