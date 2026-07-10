import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentOut
from app.core.deps import get_current_user, require_role
from app.services.activity_service import log_activity
from app.services.embedding_service import index_document
from app.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(settings.UPLOAD_DIR, stored_name)

    content_bytes = file.file.read()
    with open(filepath, "wb") as f:
        f.write(content_bytes)

    document = Document(
        title=file.filename,
        filename=stored_name,
        filepath=filepath,
        uploaded_by=admin.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Core AI step: chunk + embed + store in FAISS, mapped back to this document.
    text = content_bytes.decode("utf-8", errors="ignore")
    num_chunks = index_document(document.id, text, db)
    document.embedding_indexed = num_chunks > 0
    db.commit()
    db.refresh(document)

    log_activity(
        db, admin.id, "document_upload",
        details=f"Uploaded '{document.title}' (id={document.id}, chunks={num_chunks})",
    )
    return document


@router.get("", response_model=list[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return db.query(Document).order_by(Document.uploaded_at.desc()).all()
