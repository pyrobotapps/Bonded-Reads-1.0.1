from fastapi import APIRouter

router = APIRouter(prefix="/books", tags=["books"])

@router.get("/")
def get_books():
    return {"message": "List of books"}

@router.get("/{book_id}")
def get_book(book_id: str):
    return {"book_id": book_id}

@router.post("/")
def create_book():
    return {"message": "Book created"}