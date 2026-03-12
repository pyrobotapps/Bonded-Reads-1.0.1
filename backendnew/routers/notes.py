from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Note
from schemas import NoteCreate
from auth import verify_access_token

router = APIRouter(prefix="/api/notes", tags=["notes"])


def get_user_id(auth):
    token = auth.replace("Bearer ", "")
    payload = verify_access_token(token)
    return int(payload["sub"])


@router.post("")
async def create_note(
    data: NoteCreate,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    note = Note(
        user_id=user_id,
        book_id=data.book_id,
        content=data.content,
        is_public=data.is_public
    )

    db.add(note)
    await db.commit()

    return note


@router.get("/my")
async def get_my_notes(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    user_id = get_user_id(authorization)

    result = await db.execute(select(Note).where(Note.user_id == user_id))
    return result.scalars().all()


@router.get("/public/{book_id}")
async def get_public_notes(book_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(
        select(Note).where(
            Note.book_id == book_id,
            Note.is_public == True
        )
    )

    return result.scalars().all()