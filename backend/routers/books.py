from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import Book
from schemas import BookCreateSchema, BookUpdateSchema

router = APIRouter(prefix="/api/books", tags=["books"])


@router.get("/", response_model=List[BookCreateSchema])
async def get_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book))
    books = result.scalars().all()
    return books


@router.get("/{book_id}", response_model=BookCreateSchema)
async def get_book(book_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/", response_model=BookCreateSchema)
async def create_book(data: BookCreateSchema, db: AsyncSession = Depends(get_db)):
    book = Book(**data.dict())
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookCreateSchema)
async def update_book(book_id: str, data: BookUpdateSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(book, key, value)
    
    await db.commit()
    await db.refresh(book)
    return book


@router.delete("/{book_id}")
async def delete_book(book_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    await db.delete(book)
    await db.commit()
    return {"detail": "Book deleted"}