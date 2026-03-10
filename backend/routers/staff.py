from fastapi import APIRouter

router = APIRouter(prefix="/staff", tags=["staff"])

@router.get("/list")
def staff_list():
    return {"message": "Staff members"}