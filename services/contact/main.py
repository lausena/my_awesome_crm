"""Contact service FastAPI application."""

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from models import Contact, Base
from schemas import (
    ContactCreate, ContactUpdate, ContactResponse, 
    ContactList, ContactSearchQuery
)
from repository import ContactRepository
from service import ContactService
from shared.database import DatabaseManager, get_database_url
from shared.cache import CacheManager
from shared.auth import get_current_user

# Initialize database
database_url = get_database_url("contacts")
db_manager = DatabaseManager(database_url)

# Initialize cache
cache_manager = CacheManager()

# Create FastAPI app
app = FastAPI(
    title="Contact Service",
    description="CRM Contact Management Service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
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


async def get_contact_service(db: AsyncSession = Depends(get_db)) -> ContactService:
    """Get contact service instance."""
    repository = ContactRepository(db, cache_manager)
    return ContactService(repository)


# API Routes

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "contact-service"}


@app.post("/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate,
    current_user: dict = Depends(get_current_user),
    service: ContactService = Depends(get_contact_service)
):
    """Create a new contact."""
    # Set tenant_id from authenticated user
    contact_data.tenant_id = current_user["payload"].get("tenant_id", 1)
    return await service.create_contact(contact_data)


@app.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: int,
    current_user: dict = Depends(get_current_user),
    service: ContactService = Depends(get_contact_service)
):
    """Get a specific contact."""
    tenant_id = current_user["payload"].get("tenant_id", 1)
    return await service.get_contact(contact_id, tenant_id)


@app.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: int,
    contact_data: ContactUpdate,
    current_user: dict = Depends(get_current_user),
    service: ContactService = Depends(get_contact_service)
):
    """Update an existing contact."""
    tenant_id = current_user["payload"].get("tenant_id", 1)
    return await service.update_contact(contact_id, tenant_id, contact_data)


@app.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: int,
    current_user: dict = Depends(get_current_user),
    service: ContactService = Depends(get_contact_service)
):
    """Delete a contact."""
    tenant_id = current_user["payload"].get("tenant_id", 1)
    await service.delete_contact(contact_id, tenant_id)


@app.get("/contacts", response_model=ContactList)
async def search_contacts(
    query: str = Query(None, description="Search query"),
    company: str = Query(None, description="Filter by company"),
    is_active: bool = Query(None, description="Filter by active status"),
    lead_source: str = Query(None, description="Filter by lead source"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    current_user: dict = Depends(get_current_user),
    service: ContactService = Depends(get_contact_service)
):
    """Search contacts with filters and pagination."""
    tenant_id = current_user["payload"].get("tenant_id", 1)
    
    search_query = ContactSearchQuery(
        query=query,
        company=company,
        is_active=is_active,
        lead_source=lead_source,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return await service.search_contacts(search_query, tenant_id)


@app.get("/contacts/company/{company}", response_model=List[ContactResponse])
async def get_contacts_by_company(
    company: str,
    current_user: dict = Depends(get_current_user),
    service: ContactService = Depends(get_contact_service)
):
    """Get all contacts for a specific company."""
    tenant_id = current_user["payload"].get("tenant_id", 1)
    return await service.get_contacts_by_company(company, tenant_id)


@app.get("/contacts/recent", response_model=List[ContactResponse])
async def get_recent_contacts(
    limit: int = Query(10, ge=1, le=50, description="Number of contacts to return"),
    current_user: dict = Depends(get_current_user),
    service: ContactService = Depends(get_contact_service)
):
    """Get recently created contacts."""
    tenant_id = current_user["payload"].get("tenant_id", 1)
    return await service.get_recent_contacts(tenant_id, limit)


# Internal endpoints for service-to-service communication
@app.get("/internal/contacts/{contact_id}/validate")
async def validate_contact_exists(
    contact_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    service: ContactService = Depends(get_contact_service)
):
    """Internal endpoint to validate contact existence."""
    exists = await service.validate_contact_exists(contact_id, tenant_id)
    return {"exists": exists, "contact_id": contact_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)