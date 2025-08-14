"""Contact service database models."""

from sqlalchemy import String, Text, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from shared.database import Base
from typing import Optional


class Contact(Base):
    """Contact model representing individual contacts in the CRM."""
    
    __tablename__ = "contacts"
    
    # Basic Information
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    mobile: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Professional Information
    company: Mapped[Optional[str]] = mapped_column(String(200), index=True)
    title: Mapped[Optional[str]] = mapped_column(String(100))
    department: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Address Information
    address_line1: Mapped[Optional[str]] = mapped_column(String(200))
    address_line2: Mapped[Optional[str]] = mapped_column(String(200))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    postal_code: Mapped[Optional[str]] = mapped_column(String(20))
    country: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Social and Web Presence
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500))
    website: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Status and Classification
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    lead_source: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    
    # Notes and Additional Info
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Tenant isolation (for multi-tenancy)
    tenant_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    @property
    def full_name(self) -> str:
        """Get full name of the contact."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "mobile": self.mobile,
            "company": self.company,
            "title": self.title,
            "department": self.department,
            "address_line1": self.address_line1,
            "address_line2": self.address_line2,
            "city": self.city,
            "state": self.state,
            "postal_code": self.postal_code,
            "country": self.country,
            "linkedin_url": self.linkedin_url,
            "website": self.website,
            "is_active": self.is_active,
            "lead_source": self.lead_source,
            "notes": self.notes,
            "tenant_id": self.tenant_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }