from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import Book
from schemas import RecommendationSchema

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

recommendations_db = {}  # In-memory store for simplicity


@router.post("/")
async def create_recommendation(data: RecommendationSchema):
    key = f"{data.title}:{data.author}"
    recommendations_db[key] = {"title": data.title, "author": data.author, "status": "pending"}
    return recommendations_db[key]


@router.get("/")
async def get_all_recommendations(status: str = None):
    if status:
        return [r for r in recommendations_db.values() if r["status"] == status]
    return list(recommendations_db.values())


@router.get("/my")
async def get_my_recommendations(user_id: str):
    return [r for r in recommendations_db.values() if r.get("user_id") == user_id]


@router.put("/{title_author}/approve")
async def approve_recommendation(title_author: str):
    if title_author not in recommendations_db:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    recommendations_db[title_author]["status"] = "approved"
    return recommendations_db[title_author]


@router.put("/{title_author}/reject")
async def reject_recommendation(title_author: str):
    if title_author not in recommendations_db:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    recommendations_db[title_author]["status"] = "rejected"
    return recommendations_db[title_author]


@router.get("/check")
async def check_exists(title: str, author: str):
    key = f"{title}:{author}"
    return {"exists": key in recommendations_db}