from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskOut, TaskUpdateStatus
from app.core.deps import get_current_user, require_role
from app.services.activity_service import log_activity

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskOut, status_code=http_status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    assignee = db.query(User).filter(User.id == payload.assigned_to).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assigned user not found")

    task = Task(
        title=payload.title,
        description=payload.description,
        assigned_to=payload.assigned_to,
        created_by=admin.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    log_activity(db, admin.id, "task_create", details=f"Created task '{task.title}' (id={task.id})")
    return task


@router.get("", response_model=list[TaskOut])
def list_tasks(
    status: Optional[TaskStatus] = Query(default=None),
    assigned_to: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dynamic filtering: /tasks?status=completed&assigned_to=1
    Regular users only ever see their own tasks; admins can see/filter everything."""
    query = db.query(Task)

    if current_user.role.name != "admin":
        query = query.filter(Task.assigned_to == current_user.id)
    elif assigned_to is not None:
        query = query.filter(Task.assigned_to == assigned_to)

    if status is not None:
        query = query.filter(Task.status == status)

    return query.order_by(Task.created_at.desc()).all()


@router.patch("/{task_id}/status", response_model=TaskOut)
def update_task_status(
    task_id: int,
    payload: TaskUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Users may only update their own tasks; admins may update any.
    if current_user.role.name != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not your task")

    task.status = payload.status
    db.commit()
    db.refresh(task)
    log_activity(
        db, current_user.id, "task_update",
        details=f"Task id={task.id} status set to {payload.status.value}",
    )
    return task
