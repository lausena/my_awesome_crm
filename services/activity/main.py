"""Activity service FastAPI application."""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from models import Activity, Base
from shared.database import DatabaseManager, get_database_url
from shared.cache import CacheManager
from shared.auth import get_current_user

# Initialize database
database_url = get_database_url("activities")
db_manager = DatabaseManager(database_url)

# Initialize cache
cache_manager = CacheManager()

# Create FastAPI app
app = FastAPI(
    title="Activity Service",
    description="CRM Activity Management Service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Initialize services on startup."""
    await cache_manager.connect()
    
    # Create tables
    async with db_manager.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown."""
    await cache_manager.disconnect()
    await db_manager.close()


# Dependency injection
async def get_db():
    async for db in db_manager.get_session():
        yield db


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "activity-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)