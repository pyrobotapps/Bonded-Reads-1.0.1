from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import Book, ReadingStatus

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/library")
async def library_stats(db: AsyncSession = Depends(get_db)):
    total_books = (await db.execute(select(func.count(Book.id)))).scalar_one()
    total_reading_status = (await db.execute(select(func.count(ReadingStatus.id)))).scalar_one()
    
    return {
        "total_books": total_books,
        "total_reading_status": total_reading_status
    }