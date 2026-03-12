from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import ReadingStatus
from schemas import ReadingStatusCreate
from auth_helpers import verify_access_token

router = APIRouter(prefix="/api/auth/reading-status", tags=["reading"])


def get_user_id(authorization: str):
    token = authorization.replace("Bearer ", "")
    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(status_code=401)

    return int(payload["sub"])


# Set reading status
@router.post("")
async def set_status(
    data: ReadingStatusCreate,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    result = await db.execute(
        select(ReadingStatus).where(
            ReadingStatus.user_id == user_id,
            ReadingStatus.book_id == data.book_id
        )
    )

    status = result.scalar()

    if status:
        status.status = data.status
    else:
        status = ReadingStatus(
            user_id=user_id,
            book_id=data.book_id,
            status=data.status
        )
        db.add(status)

    await db.commit()

    return {"message": "Status updated"}


# Get all reading statuses
@router.get("")
async def get_all_status(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    result = await db.execute(
        select(ReadingStatus).where(ReadingStatus.user_id == user_id)
    )

    statuses = result.scalars().all()

    return statuses


# Get status for book
@router.get("/{book_id}")
async def get_status(
    book_id: int,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    result = await db.execute(
        select(ReadingStatus).where(
            ReadingStatus.user_id == user_id,
            ReadingStatus.book_id == book_id
        )
    )

    status = result.scalar()

    if not status:
        return {"status": None}

    return {"status": status.status}