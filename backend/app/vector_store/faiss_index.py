import os
import pickle
import faiss
import numpy as np

INDEX_DIR = "vector_store_data"
INDEX_PATH = os.path.join(INDEX_DIR, "index.faiss")
META_PATH = os.path.join(INDEX_DIR, "meta.pkl")
EMBEDDING_DIM = 384  # matches all-MiniLM-L6-v2 output size


class VectorStore:
    """Thin wrapper around a flat L2 FAISS index with a parallel metadata list.

    metadata[i] corresponds to the vector at position i in the index, and holds
    {"document_id": int, "chunk_text": str} so search results can be traced
    back to source documents.
    """

    def __init__(self):
        os.makedirs(INDEX_DIR, exist_ok=True)
        if os.path.exists(INDEX_PATH) and os.path.exists(META_PATH):
            self.index = faiss.read_index(INDEX_PATH)
            with open(META_PATH, "rb") as f:
                self.metadata = pickle.load(f)
        else:
            self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
            self.metadata: list[dict] = []

    def add(self, vectors: np.ndarray, meta_entries: list[dict]) -> list[int]:
        """Adds vectors + metadata, returns the faiss positions assigned."""
        start_pos = self.index.ntotal
        self.index.add(vectors)
        self.metadata.extend(meta_entries)
        self._save()
        return list(range(start_pos, start_pos + len(meta_entries)))

    def search(self, query_vector: np.ndarray, k: int = 5) -> list[dict]:
        if self.index.ntotal == 0:
            return []
        k = min(k, self.index.ntotal)
        distances, indices = self.index.search(query_vector, k)
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            entry = self.metadata[idx]
            results.append(
                {
                    "document_id": entry["document_id"],
                    "chunk_text": entry["chunk_text"],
                    "score": float(dist),  # lower = more similar (L2 distance)
                }
            )
        return results

    def _save(self):
        faiss.write_index(self.index, INDEX_PATH)
        with open(META_PATH, "wb") as f:
            pickle.dump(self.metadata, f)


vector_store = VectorStore()
