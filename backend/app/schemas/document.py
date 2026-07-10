from pydantic import BaseModel
from datetime import datetime


class DocumentOut(BaseModel):
    id: int
    title: str
    filename: str
    uploaded_by: int
    uploaded_at: datetime
    embedding_indexed: bool

    class Config:
        from_attributes = True


class SearchResultItem(BaseModel):
    document_id: int
    chunk_text: str
    score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
