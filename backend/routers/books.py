from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from database import get_db
from models import Book
from schemas import BookCreate, BookResponse

router = APIRouter(prefix="/api/auth/books", tags=["books"])


# GET ALL BOOKS
@router.get("", response_model=List[BookResponse])
async def get_books(
    is_abo: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):

    query = select(Book)

    if is_abo is not None:
        query = query.where(Book.is_abo == is_abo)

    result = await db.execute(query)
    books = result.scalars().all()

    return books


# GET TOP BOOKS
@router.get("/top", response_model=List[BookResponse])
async def get_top_books(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(select(Book).limit(limit))
    books = result.scalars().all()

    return books


# GET SINGLE BOOK
@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    return book


# CREATE BOOK
@router.post("")
async def create_book(
    data: BookCreate,
    db: AsyncSession = Depends(get_db)
):

    book = Book(
        title=data.title,
        author=data.author,
        description=data.description,
        cover_url=data.cover_url,
        is_abo=data.is_abo
    )

    db.add(book)
    await db.commit()
    await db.refresh(book)

    return book


# UPDATE BOOK
@router.put("/{book_id}")
async def update_book(
    book_id: int,
    data: BookCreate,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar()

    if not book:
        raise HTTPException(status_code=404)

    book.title = data.title
    book.author = data.author
    book.description = data.description
    book.cover_url = data.cover_url
    book.is_abo = data.is_abo

    await db.commit()

    return book


# DELETE BOOK
@router.delete("/{book_id}")
async def delete_book(book_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar()

    if not book:
        raise HTTPException(status_code=404)

    await db.delete(book)
    await db.commit()

    return {"message": "Book deleted"}


# BATCH IMPORT
@router.post("/batch-import")
async def batch_import(data: dict, db: AsyncSession = Depends(get_db)):

    books = data.get("books", [])

    for b in books:
        book = Book(
            title=b.get("title"),
            author=b.get("author"),
            description=b.get("description"),
            cover_url=b.get("cover_url"),
            is_abo=b.get("is_abo", False)
        )
        db.add(book)

    await db.commit()

    return {"message": "Books imported"}


# GENRES (placeholder for now)
@router.get("/genres")
async def get_genres():
    return [
        "Omegaverse",
        "School",
        "Mafia",
        "Fantasy",
        "Historical",
        "Modern",
        "Office"
    ]