from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Vote
from schemas import VoteCreate
from auth_helpers import verify_access_token

router = APIRouter(prefix="/api/books", tags=["voting"])


def get_user_id(authorization: str):
    token = authorization.replace("Bearer ", "")
    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(status_code=401)

    return int(payload["sub"])


# Vote on book
@router.post("/{book_id}/vote")
async def vote_book(
    book_id: int,
    data: VoteCreate,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    result = await db.execute(
        select(Vote).where(
            Vote.book_id == book_id,
            Vote.user_id == user_id
        )
    )

    vote = result.scalar()

    if vote:
        vote.rating = data.rating
    else:
        vote = Vote(
            book_id=book_id,
            user_id=user_id,
            rating=data.rating
        )
        db.add(vote)

    await db.commit()

    return {"message": "Vote saved"}


# Get my vote
@router.get("/{book_id}/my-vote")
async def get_my_vote(
    book_id: int,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    result = await db.execute(
        select(Vote).where(
            Vote.book_id == book_id,
            Vote.user_id == user_id
        )
    )

    vote = result.scalar()

    if not vote:
        return {"rating": None}

    return {"rating": vote.rating}