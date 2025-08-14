"""Contact service Pydantic schemas for API validation."""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class ContactBase(BaseModel):
    """Base contact schema with common fields."""
    
    first_name: str = Field(..., min_length=1, max_length=100, description="Contact's first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Contact's last name")
    email: Optional[EmailStr] = Field(None, description="Contact's email address")
    phone: Optional[str] = Field(None, max_length=20, description="Contact's phone number")
    mobile: Optional[str] = Field(None, max_length=20, description="Contact's mobile number")
    
    company: Optional[str] = Field(None, max_length=200, description="Contact's company")
    title: Optional[str] = Field(None, max_length=100, description="Contact's job title")
    department: Optional[str] = Field(None, max_length=100, description="Contact's department")
    
    address_line1: Optional[str] = Field(None, max_length=200, description="Address line 1")
    address_line2: Optional[str] = Field(None, max_length=200, description="Address line 2")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=100, description="State")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")
    country: Optional[str] = Field(None, max_length=100, description="Country")
    
    linkedin_url: Optional[str] = Field(None, max_length=500, description="LinkedIn URL")
    website: Optional[str] = Field(None, max_length=500, description="Website URL")
    
    is_active: bool = Field(True, description="Whether the contact is active")
    lead_source: Optional[str] = Field(None, max_length=100, description="Source where contact was acquired")
    notes: Optional[str] = Field(None, description="Additional notes about the contact")
    
    @validator('email')
    def validate_email(cls, v):
        if v is not None and v.strip() == "":
            return None
        return v
    
    @validator('phone', 'mobile')
    def validate_phone(cls, v):
        if v is not None:
            # Simple phone validation - remove all non-digits and check length
            digits = ''.join(filter(str.isdigit, v))
            if len(digits) < 7 or len(digits) > 15:
                raise ValueError('Phone number must be between 7 and 15 digits')
        return v


class ContactCreate(ContactBase):
    """Schema for creating a new contact."""
    
    tenant_id: int = Field(..., description="Tenant ID for multi-tenancy")


class ContactUpdate(BaseModel):
    """Schema for updating an existing contact."""
    
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    mobile: Optional[str] = Field(None, max_length=20)
    
    company: Optional[str] = Field(None, max_length=200)
    title: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    
    address_line1: Optional[str] = Field(None, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    
    linkedin_url: Optional[str] = Field(None, max_length=500)
    website: Optional[str] = Field(None, max_length=500)
    
    is_active: Optional[bool] = None
    lead_source: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    """Schema for contact response."""
    
    id: int
    full_name: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ContactList(BaseModel):
    """Schema for paginated contact list response."""
    
    contacts: list[ContactResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool


class ContactSearchQuery(BaseModel):
    """Schema for contact search query."""
    
    query: Optional[str] = Field(None, description="Search query for name, email, or company")
    company: Optional[str] = Field(None, description="Filter by company")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    lead_source: Optional[str] = Field(None, description="Filter by lead source")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Page size")
    sort_by: str = Field("created_at", description="Sort field")
    sort_order: str = Field("desc", pattern="^(asc|desc)$", description="Sort order")