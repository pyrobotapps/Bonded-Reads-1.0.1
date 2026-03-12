from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import List, ListBook
from schemas import ListCreate
from auth_helpers import verify_access_token

router = APIRouter(prefix="/api/lists", tags=["lists"])


def get_user_id(auth):
    token = auth.replace("Bearer ", "")
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401)
    return int(payload["sub"])


@router.post("")
async def create_list(
    data: ListCreate,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    user_id = get_user_id(authorization)

    new_list = List(user_id=user_id, name=data.name)
    db.add(new_list)

    await db.commit()
    await db.refresh(new_list)

    return new_list


@router.get("")
async def get_lists(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    user_id = get_user_id(authorization)

    result = await db.execute(select(List).where(List.user_id == user_id))
    return result.scalars().all()


@router.post("/{list_id}/books/{book_id}")
async def add_book(
    list_id: int,
    book_id: int,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):

    item = ListBook(list_id=list_id, book_id=book_id)
    db.add(item)

    await db.commit()

    return {"message": "Book added"}


@router.delete("/{list_id}/books/{book_id}")
async def remove_book(
    list_id: int,
    book_id: int,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(ListBook).where(
            ListBook.list_id == list_id,
            ListBook.book_id == book_id
        )
    )

    item = result.scalar()

    if not item:
        raise HTTPException(status_code=404)

    await db.delete(item)
    await db.commit()

    return {"message": "Removed"}