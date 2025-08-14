"""Contact service business logic."""

from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from models import Contact
from schemas import ContactCreate, ContactUpdate, ContactSearchQuery, ContactList, ContactResponse
from repository import ContactRepository
from shared.cache import CacheManager


class ContactService:
    """Service layer for contact business logic."""
    
    def __init__(self, repository: ContactRepository):
        self.repository = repository
    
    async def create_contact(self, contact_data: ContactCreate) -> ContactResponse:
        """Create a new contact with business logic validation."""
        # Check for duplicate email if provided
        if contact_data.email:
            existing_contact = await self.repository.get_by_email(
                contact_data.email, contact_data.tenant_id
            )
            if existing_contact and existing_contact.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Contact with this email already exists"
                )
        
        # Create the contact
        contact = await self.repository.create(contact_data)
        return ContactResponse(**contact.to_dict())
    
    async def get_contact(self, contact_id: int, tenant_id: int) -> ContactResponse:
        """Get a contact by ID."""
        contact = await self.repository.get_by_id(contact_id, tenant_id)
        if not contact or not contact.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact not found"
            )
        
        return ContactResponse(**contact.to_dict())
    
    async def update_contact(self, contact_id: int, tenant_id: int, contact_data: ContactUpdate) -> ContactResponse:
        """Update an existing contact."""
        # Check for duplicate email if being updated
        if contact_data.email:
            existing_contact = await self.repository.get_by_email(
                contact_data.email, tenant_id
            )
            if existing_contact and existing_contact.id != contact_id and existing_contact.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Another contact with this email already exists"
                )
        
        contact = await self.repository.update(contact_id, tenant_id, contact_data)
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact not found"
            )
        
        return ContactResponse(**contact.to_dict())
    
    async def delete_contact(self, contact_id: int, tenant_id: int) -> bool:
        """Delete a contact (soft delete)."""
        success = await self.repository.delete(contact_id, tenant_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact not found"
            )
        return success
    
    async def search_contacts(self, search_query: ContactSearchQuery, tenant_id: int) -> ContactList:
        """Search contacts with pagination."""
        contacts, total = await self.repository.search(search_query, tenant_id)
        
        contact_responses = [ContactResponse(**contact.to_dict()) for contact in contacts]
        
        has_next = (search_query.page * search_query.page_size) < total
        has_prev = search_query.page > 1
        
        return ContactList(
            contacts=contact_responses,
            total=total,
            page=search_query.page,
            page_size=search_query.page_size,
            has_next=has_next,
            has_prev=has_prev
        )
    
    async def get_contacts_by_company(self, company: str, tenant_id: int) -> List[ContactResponse]:
        """Get all contacts for a specific company."""
        contacts = await self.repository.get_by_company(company, tenant_id)
        return [ContactResponse(**contact.to_dict()) for contact in contacts]
    
    async def get_recent_contacts(self, tenant_id: int, limit: int = 10) -> List[ContactResponse]:
        """Get recently created contacts."""
        contacts = await self.repository.get_recent(tenant_id, limit)
        return [ContactResponse(**contact.to_dict()) for contact in contacts]
    
    async def validate_contact_exists(self, contact_id: int, tenant_id: int) -> bool:
        """Validate that a contact exists and is active."""
        contact = await self.repository.get_by_id(contact_id, tenant_id)
        return contact is not None and contact.is_active