from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from database import get_db
from models import User
from schemas import RegisterSchema, LoginSchema
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(data: RegisterSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=data.email,
        username=data.username,
        password=hash_password(data.password)
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(
        {"sub": str(new_user.id)},
        timedelta(minutes=60)
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/login")
async def login(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        {"sub": str(user.id)},
        timedelta(minutes=60)
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
async def get_me():
    return {"message": "Authenticated user"}