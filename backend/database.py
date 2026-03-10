import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import sqlalchemy.engine.url as url

# Get Neon DATABASE_URL from env
DATABASE_URL = os.environ.get("DATABASE_URL")

# asyncpg requires ssl configuration
connect_args = {"ssl": True}

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args=connect_args
)

# Base class
Base = declarative_base()

# Async session maker
SessionLocal = sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession
)

async def get_db():
    async with SessionLocal() as session:
        yield session