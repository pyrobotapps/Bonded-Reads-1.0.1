from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import StaffApplication
from schemas import StaffApplicationCreate
from auth_helpers import verify_access_token

router = APIRouter(prefix="/api/auth/staff-applications", tags=["staff"])


def get_user_id(auth):
    token = auth.replace("Bearer ", "")
    payload = verify_access_token(token)
    return int(payload["sub"])


@router.post("")
async def apply(
    data: StaffApplicationCreate,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    app = StaffApplication(
        user_id=user_id,
        reason=data.reason
    )

    db.add(app)
    await db.commit()

    return app