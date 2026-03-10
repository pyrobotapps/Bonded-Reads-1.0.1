from fastapi import APIRouter

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/")
def get_recommendations():
    return {"message": "Recommendations"}