# backend/schemas.py

from pydantic import BaseModel, Field
from typing import Optional


class RegisterSchema(BaseModel):
    username: str
    email: str
    password: str


class LoginSchema(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True

class BookCreate(BaseModel):
    title: str
    author: Optional[str]
    description: Optional[str]
    cover_url: Optional[str]
    is_abo: Optional[bool] = False


class BookResponse(BaseModel):
    id: int
    title: str
    author: Optional[str]
    description: Optional[str]
    cover_url: Optional[str]
    is_abo: bool

    class Config:
        from_attributes = True


class VoteCreate(BaseModel):
    rating: int = Field(ge=1, le=5)


class ReadingStatusCreate(BaseModel):
    book_id: int
    status: str


class ListCreate(BaseModel):
    name: str


class NoteCreate(BaseModel):
    book_id: int
    content: str
    is_public: bool = False


class RecommendationCreate(BaseModel):
    title: str
    author: Optional[str]
    description: Optional[str]


class StaffApplicationCreate(BaseModel):
    reason: str

class LibraryStats(BaseModel):
    readng: int
    completed: int
    plan_to_read: int