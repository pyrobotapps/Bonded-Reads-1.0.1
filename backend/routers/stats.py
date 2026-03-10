from fastapi import APIRouter

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/library")
def library_stats():
    return {"message": "Library stats"}