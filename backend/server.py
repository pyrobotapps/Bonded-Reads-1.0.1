import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base

from routers import (
    auth,
    books,
    voting,
    reading,
    lists,
    notes,
    stats,
    recommendations,
    staff,
    staff_applications
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bondedreads.netlify.app/"],  # replace later with Netlify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(voting.router)
app.include_router(reading.router)
app.include_router(lists.router)
app.include_router(notes.router)
app.include_router(stats.router)
app.include_router(recommendations.router)
app.include_router(staff.router)
app.include_router(staff_applications.router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("server:app", host="0.0.0.0", port=port)

@app.get("/")
async def root():
    return {"message": "API is running"}