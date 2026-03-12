from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import ReadingStatus
from auth_helpers import verify_access_token

router = APIRouter(prefix="/api/auth/stats", tags=["stats"])


def get_user_id(auth):
    token = auth.replace("Bearer ", "")
    payload = verify_access_token(token)
    return int(payload["sub"])


@router.get("/library")
async def get_library_stats(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    result = await db.execute(
        select(ReadingStatus).where(ReadingStatus.user_id == user_id)
    )

    statuses = result.scalars().all()

    stats = {
        "reading": 0,
        "completed": 0,
        "plan_to_read": 0
    }

    for s in statuses:
        if s.status in stats:
            stats[s.status] += 1

    return stats