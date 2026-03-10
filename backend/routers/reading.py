from fastapi import APIRouter

router = APIRouter(prefix="/reading-status", tags=["reading"])

@router.post("/")
def set_status():
    return {"message": "Reading status updated"}

@router.get("/")
def get_status():
    return {"message": "Reading statuses"}