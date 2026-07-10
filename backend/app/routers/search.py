from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.activity_log import SearchLog
from app.schemas.document import SearchResponse
from app.core.deps import get_current_user
from app.services.activity_service import log_activity
from app.services.embedding_service import semantic_search

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1, description="Natural language search query"),
    k: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = semantic_search(q, k=k)

    db.add(SearchLog(user_id=current_user.id, query=q))
    db.commit()
    log_activity(db, current_user.id, "search", details=q)

    return SearchResponse(query=q, results=results)
