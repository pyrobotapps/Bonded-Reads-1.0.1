from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import Note
from schemas import NoteCreateSchema

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.post("/")
async def create_note(data: NoteCreateSchema, db: AsyncSession = Depends(get_db)):
    note = Note(**data.dict())
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.get("/my", response_model=List[NoteCreateSchema])
async def get_my_notes(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.user_id == user_id))
    return result.scalars().all()


@router.get("/book/{book_id}", response_model=List[NoteCreateSchema])
async def get_notes_for_book(book_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.book_id == book_id))
    return result.scalars().all()


@router.get("/public/{book_id}", response_model=List[NoteCreateSchema])
async def get_public_notes(book_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.book_id == book_id, Note.public == "true"))
    return result.scalars().all()


@router.delete("/{note_id}")
async def delete_note(note_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()
    return {"detail": "Note deleted"}