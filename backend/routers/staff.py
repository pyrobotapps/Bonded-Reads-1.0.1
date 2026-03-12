from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User

router = APIRouter(prefix="/api/auth/staff", tags=["staff"])


@router.get("/list")
async def staff_list(db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(User).where(User.role == "staff"))
    return result.scalars().all()


@router.delete("/{user_id}")
async def remove_staff(user_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar()

    user.role = "user"

    await db.commit()

    return {"message": "Staff removed"}