from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.api.deps.auth import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.user import AuthResponse, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate = Body(...)):
    with SessionLocal() as db:
        existing = db.execute(
            select(User).where(User.email == payload.email.lower().strip())
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            name=payload.name.strip(),
            email=payload.email.lower().strip(),
            password_hash=hash_password(payload.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email},
        }


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin = Body(...)):
    with SessionLocal() as db:
        user = db.execute(
            select(User).where(User.email == payload.email.lower().strip())
        ).scalar_one_or_none()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token(user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email},
        }


@router.post("/token", response_model=AuthResponse)
def token(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2 form uses "username" field; treat it as email
    email = form_data.username.lower().strip()
    password = form_data.password

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        access_token = create_access_token(user.id)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email},
        }


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}