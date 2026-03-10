from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter(prefix="/api/staff", tags=["staff"])

staff_db = {}  # In-memory staff list for now


@router.get("/list")
async def get_staff_list():
    return list(staff_db.values())


@router.delete("/{user_id}")
async def remove_staff(user_id: str):
    if user_id not in staff_db:
        raise HTTPException(status_code=404, detail="Staff member not found")
    del staff_db[user_id]
    return {"detail": "Staff removed"}