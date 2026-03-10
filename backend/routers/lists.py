from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import Book
from models import User
from schemas import ListCreateSchema
from database import get_db

router = APIRouter(prefix="/api/lists", tags=["lists"])

lists_db = {}  # Simple in-memory storage if you don't have a Lists model yet

@router.post("/")
async def create_list(data: ListCreateSchema):
    lists_db[data.name] = []
    return {"detail": f"List {data.name} created"}

@router.get("/")
async def get_all_lists():
    return lists_db

@router.post("/{list_name}/books/{book_id}")
async def add_book(list_name: str, book_id: str):
    if list_name not in lists_db:
        raise HTTPException(status_code=404, detail="List not found")
    lists_db[list_name].append(book_id)
    return {"detail": f"Book {book_id} added to {list_name}"}

@router.delete("/{list_name}/books/{book_id}")
async def remove_book(list_name: str, book_id: str):
    if list_name not in lists_db or book_id not in lists_db[list_name]:
        raise HTTPException(status_code=404, detail="Book or list not found")
    lists_db[list_name].remove(book_id)
    return {"detail": f"Book {book_id} removed from {list_name}"}