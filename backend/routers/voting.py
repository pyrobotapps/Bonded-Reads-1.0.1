from fastapi import APIRouter

router = APIRouter(prefix="/vote", tags=["vote"])

@router.post("/{book_id}")
def vote(book_id: str):
    return {"message": f"Vote submitted for {book_id}"}