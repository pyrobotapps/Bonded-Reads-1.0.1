from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Recommendation
from schemas import RecommendationCreate
from auth_helpers import verify_access_token

router = APIRouter(prefix="/api/auth/recommendations", tags=["recommendations"])


def get_user_id(auth):
    token = auth.replace("Bearer ", "")
    payload = verify_access_token(token)
    return int(payload["sub"])


@router.post("")
async def create_recommendation(
    data: RecommendationCreate,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    rec = Recommendation(
        user_id=user_id,
        title=data.title,
        author=data.author,
        description=data.description
    )

    db.add(rec)
    await db.commit()

    return rec