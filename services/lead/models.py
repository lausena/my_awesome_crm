"""Lead service database models."""

from sqlalchemy import String, Text, Integer, Float, Enum as SqlEnum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from shared.database import Base
from typing import Optional
import enum


class LeadStatus(str, enum.Enum):
    """Lead status enumeration."""
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    UNQUALIFIED = "unqualified"
    CONVERTED = "converted"
    LOST = "lost"


class LeadSource(str, enum.Enum):
    """Lead source enumeration."""
    WEBSITE = "website"
    EMAIL_MARKETING = "email_marketing"
    SOCIAL_MEDIA = "social_media"
    REFERRAL = "referral"
    COLD_CALL = "cold_call"
    TRADE_SHOW = "trade_show"
    WEBINAR = "webinar"
    CONTENT_DOWNLOAD = "content_download"
    OTHER = "other"


class Lead(Base):
    """Lead model representing potential customers."""
    
    __tablename__ = "leads"
    
    # Basic Contact Information
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Company Information
    company: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    title: Mapped[Optional[str]] = mapped_column(String(100))
    industry: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    company_size: Mapped[Optional[str]] = mapped_column(String(50))
    annual_revenue: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Lead Classification
    status: Mapped[LeadStatus] = mapped_column(
        SqlEnum(LeadStatus), 
        default=LeadStatus.NEW, 
        nullable=False, 
        index=True
    )
    source: Mapped[LeadSource] = mapped_column(
        SqlEnum(LeadSource), 
        default=LeadSource.OTHER, 
        nullable=False, 
        index=True
    )
    
    # Lead Scoring
    score: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium", index=True)  # low, medium, high
    
    # Sales Information
    estimated_value: Mapped[Optional[float]] = mapped_column(Float)
    expected_close_date: Mapped[Optional[str]] = mapped_column(String(10))  # YYYY-MM-DD
    
    # Assignment
    assigned_to: Mapped[Optional[int]] = mapped_column(Integer, index=True)  # User ID
    
    # Qualification (BANT)
    budget_qualified: Mapped[bool] = mapped_column(Boolean, default=False)
    authority_qualified: Mapped[bool] = mapped_column(Boolean, default=False)
    need_qualified: Mapped[bool] = mapped_column(Boolean, default=False)
    timeline_qualified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Additional Information
    notes: Mapped[Optional[str]] = mapped_column(Text)
    campaign: Mapped[Optional[str]] = mapped_column(String(200), index=True)
    utm_source: Mapped[Optional[str]] = mapped_column(String(100))
    utm_medium: Mapped[Optional[str]] = mapped_column(String(100))
    utm_campaign: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Status tracking
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    converted_to_contact_id: Mapped[Optional[int]] = mapped_column(Integer)
    converted_to_opportunity_id: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Tenant isolation
    tenant_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    @property
    def full_name(self) -> str:
        """Get full name of the lead."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_qualified(self) -> bool:
        """Check if lead is qualified based on BANT criteria."""
        return all([
            self.budget_qualified,
            self.authority_qualified,
            self.need_qualified,
            self.timeline_qualified
        ])
    
    def calculate_score(self) -> float:
        """Calculate lead score based on various factors."""
        base_score = 0.0
        
        # Company size scoring
        company_size_scores = {
            "1-10": 10,
            "11-50": 20,
            "51-200": 30,
            "201-1000": 40,
            "1000+": 50
        }
        base_score += company_size_scores.get(self.company_size, 0)
        
        # Source scoring
        source_scores = {
            LeadSource.REFERRAL: 30,
            LeadSource.WEBINAR: 25,
            LeadSource.CONTENT_DOWNLOAD: 20,
            LeadSource.WEBSITE: 15,
            LeadSource.EMAIL_MARKETING: 10,
            LeadSource.SOCIAL_MEDIA: 10,
            LeadSource.TRADE_SHOW: 15,
            LeadSource.COLD_CALL: 5,
            LeadSource.OTHER: 5
        }
        base_score += source_scores.get(self.source, 0)
        
        # BANT qualification bonus
        if self.is_qualified:
            base_score += 40
        else:
            qualification_count = sum([
                self.budget_qualified,
                self.authority_qualified,
                self.need_qualified,
                self.timeline_qualified
            ])
            base_score += qualification_count * 10
        
        # Title scoring (decision maker indicators)
        if self.title:
            decision_maker_keywords = ["ceo", "cto", "cfo", "president", "director", "manager", "head", "vp"]
            if any(keyword in self.title.lower() for keyword in decision_maker_keywords):
                base_score += 20
        
        return min(base_score, 100.0)  # Cap at 100
    
    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "company": self.company,
            "title": self.title,
            "industry": self.industry,
            "company_size": self.company_size,
            "annual_revenue": self.annual_revenue,
            "status": self.status.value,
            "source": self.source.value,
            "score": self.score,
            "priority": self.priority,
            "estimated_value": self.estimated_value,
            "expected_close_date": self.expected_close_date,
            "assigned_to": self.assigned_to,
            "budget_qualified": self.budget_qualified,
            "authority_qualified": self.authority_qualified,
            "need_qualified": self.need_qualified,
            "timeline_qualified": self.timeline_qualified,
            "is_qualified": self.is_qualified,
            "notes": self.notes,
            "campaign": self.campaign,
            "utm_source": self.utm_source,
            "utm_medium": self.utm_medium,
            "utm_campaign": self.utm_campaign,
            "is_active": self.is_active,
            "converted_to_contact_id": self.converted_to_contact_id,
            "converted_to_opportunity_id": self.converted_to_opportunity_id,
            "tenant_id": self.tenant_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }