"""Contact service repository for database operations."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from models import Contact
from schemas import ContactCreate, ContactUpdate, ContactSearchQuery
from shared.cache import CacheManager


class ContactRepository:
    """Repository for contact database operations."""
    
    def __init__(self, db: AsyncSession, cache: CacheManager):
        self.db = db
        self.cache = cache
    
    async def create(self, contact_data: ContactCreate) -> Contact:
        """Create a new contact."""
        contact = Contact(**contact_data.dict())
        self.db.add(contact)
        await self.db.commit()
        await self.db.refresh(contact)
        
        # Cache the new contact
        await self.cache.set(f"contact:{contact.id}", contact.to_dict(), expire=300)
        
        return contact
    
    async def get_by_id(self, contact_id: int, tenant_id: int) -> Optional[Contact]:
        """Get contact by ID and tenant ID."""
        # Try cache first
        cache_key = f"contact:{contact_id}"
        cached_contact = await self.cache.get(cache_key)
        
        if cached_contact and cached_contact.get("tenant_id") == tenant_id:
            # Convert cached dict back to Contact object
            return Contact(**cached_contact)
        
        # Query database
        result = await self.db.execute(
            select(Contact).where(
                Contact.id == contact_id,
                Contact.tenant_id == tenant_id
            )
        )
        contact = result.scalar_one_or_none()
        
        if contact:
            # Cache the result
            await self.cache.set(cache_key, contact.to_dict(), expire=300)
        
        return contact
    
    async def get_by_email(self, email: str, tenant_id: int) -> Optional[Contact]:
        """Get contact by email and tenant ID."""
        result = await self.db.execute(
            select(Contact).where(
                Contact.email == email,
                Contact.tenant_id == tenant_id
            )
        )
        return result.scalar_one_or_none()
    
    async def update(self, contact_id: int, tenant_id: int, contact_data: ContactUpdate) -> Optional[Contact]:
        """Update an existing contact."""
        contact = await self.get_by_id(contact_id, tenant_id)
        if not contact:
            return None
        
        # Update only provided fields
        update_data = contact_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(contact, field, value)
        
        await self.db.commit()
        await self.db.refresh(contact)
        
        # Update cache
        cache_key = f"contact:{contact.id}"
        await self.cache.set(cache_key, contact.to_dict(), expire=300)
        
        return contact
    
    async def delete(self, contact_id: int, tenant_id: int) -> bool:
        """Delete a contact (soft delete by setting is_active=False)."""
        contact = await self.get_by_id(contact_id, tenant_id)
        if not contact:
            return False
        
        contact.is_active = False
        await self.db.commit()
        
        # Remove from cache
        await self.cache.delete(f"contact:{contact.id}")
        
        return True
    
    async def search(self, search_query: ContactSearchQuery, tenant_id: int) -> Tuple[List[Contact], int]:
        """Search contacts with pagination."""
        query = select(Contact).where(Contact.tenant_id == tenant_id)
        
        # Apply filters
        if search_query.query:
            search_term = f"%{search_query.query}%"
            query = query.where(
                or_(
                    Contact.first_name.ilike(search_term),
                    Contact.last_name.ilike(search_term),
                    Contact.email.ilike(search_term),
                    Contact.company.ilike(search_term)
                )
            )
        
        if search_query.company:
            query = query.where(Contact.company.ilike(f"%{search_query.company}%"))
        
        if search_query.is_active is not None:
            query = query.where(Contact.is_active == search_query.is_active)
        
        if search_query.lead_source:
            query = query.where(Contact.lead_source == search_query.lead_source)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if search_query.sort_by == "name":
            order_field = Contact.first_name
        elif search_query.sort_by == "company":
            order_field = Contact.company
        elif search_query.sort_by == "email":
            order_field = Contact.email
        elif search_query.sort_by == "updated_at":
            order_field = Contact.updated_at
        else:
            order_field = Contact.created_at
        
        if search_query.sort_order == "desc":
            order_field = order_field.desc()
        
        query = query.order_by(order_field)
        
        # Apply pagination
        offset = (search_query.page - 1) * search_query.page_size
        query = query.offset(offset).limit(search_query.page_size)
        
        # Execute query
        result = await self.db.execute(query)
        contacts = result.scalars().all()
        
        return contacts, total
    
    async def get_by_company(self, company: str, tenant_id: int) -> List[Contact]:
        """Get all contacts for a specific company."""
        result = await self.db.execute(
            select(Contact).where(
                Contact.company == company,
                Contact.tenant_id == tenant_id,
                Contact.is_active == True
            ).order_by(Contact.first_name, Contact.last_name)
        )
        return result.scalars().all()
    
    async def get_recent(self, tenant_id: int, limit: int = 10) -> List[Contact]:
        """Get recently created contacts."""
        result = await self.db.execute(
            select(Contact).where(
                Contact.tenant_id == tenant_id,
                Contact.is_active == True
            ).order_by(Contact.created_at.desc()).limit(limit)
        )
        return result.scalars().all()