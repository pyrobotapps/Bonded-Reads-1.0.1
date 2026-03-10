from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import Vote
from schemas import VoteSchema
from database import get_db

router = APIRouter(prefix="/api/votes", tags=["votes"])


@router.post("/")
async def vote(data: VoteSchema, db: AsyncSession = Depends(get_db)):
    vote = Vote(**data.dict())
    db.add(vote)
    await db.commit()
    await db.refresh(vote)
    return vote


@router.get("/{user_id}/{book_id}")
async def get_my_vote(user_id: str, book_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vote).where(Vote.user_id == user_id, Vote.book_id == book_id))
    vote = result.scalar_one_or_none()
    return vote