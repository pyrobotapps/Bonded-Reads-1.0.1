from fastapi import APIRouter

router = APIRouter(prefix="/lists", tags=["lists"])

@router.get("/")
def get_lists():
    return {"message": "User lists"}

@router.post("/")
def create_list():
    return {"message": "List created"}