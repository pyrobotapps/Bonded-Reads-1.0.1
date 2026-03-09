from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str
    code: str = ""

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class BookCreate(BaseModel):
    title: str
    author: str
    description: str
    genre: str

class VoteSchema(BaseModel):
    rating: int

class ReadingSchema(BaseModel):
    book_id: str
    status: str

class NoteSchema(BaseModel):
    book_id: str
    content: str
    public: bool = False