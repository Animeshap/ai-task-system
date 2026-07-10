from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.task import Task, TaskStatus
from app.models.activity_log import SearchLog
from app.core.deps import require_role

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("")
def get_analytics(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin")),
):
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == TaskStatus.completed).count()
    pending_tasks = total_tasks - completed_tasks

    top_queries = (
        db.query(SearchLog.query, func.count(SearchLog.id).label("count"))
        .group_by(SearchLog.query)
        .order_by(func.count(SearchLog.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "most_searched_queries": [{"query": q, "count": c} for q, c in top_queries],
    }
