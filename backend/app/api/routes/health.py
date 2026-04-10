from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from app.db.session import SessionLocal

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/health/live")
def health_live():
    return {"status": "live"}


@router.get("/health/ready")
def health_ready():
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "ok"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"database not ready: {exc}")