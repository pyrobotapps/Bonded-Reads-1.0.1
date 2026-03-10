from fastapi import APIRouter

router = APIRouter(prefix="/notes", tags=["notes"])

@router.get("/")
def get_notes():
    return {"message": "Notes"}

@router.post("/")
def create_note():
    return {"message": "Note created"}