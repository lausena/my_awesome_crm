"""Shared database configuration and utilities."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func
from datetime import datetime
from typing import AsyncGenerator
import os


class Base(DeclarativeBase):
    """Base class for all database models."""
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class DatabaseManager:
    """Database connection and session management."""
    
    def __init__(self, database_url: str):
        self.engine = create_async_engine(database_url, echo=False)
        self.async_session = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
    
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get database session."""
        async with self.async_session() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def close(self):
        """Close database connection."""
        await self.engine.dispose()


def get_database_url(service_name: str) -> str:
    """Get database URL for a specific service."""
    return os.getenv("DATABASE_URL", f"postgresql://crm_user:crm_password@localhost:5432/crm_{service_name}")