from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from app.db.session import SessionLocal

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check():
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok", "live": True, "ready": True, "database": "ok"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"database not ready: {exc}")