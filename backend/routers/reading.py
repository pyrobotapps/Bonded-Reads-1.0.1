from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import ReadingStatus
from schemas import ReadingStatusSchema
from database import get_db

router = APIRouter(prefix="/api/reading-status", tags=["reading"])


@router.post("/")
async def set_status(data: ReadingStatusSchema, db: AsyncSession = Depends(get_db)):
    status = ReadingStatus(**data.dict())
    db.add(status)
    await db.commit()
    await db.refresh(status)
    return status


@router.get("/")
async def get_all(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ReadingStatus))
    return result.scalars().all()


@router.get("/{book_id}")
async def get_for_book(book_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ReadingStatus).where(ReadingStatus.book_id == book_id))
    return result.scalars().all()