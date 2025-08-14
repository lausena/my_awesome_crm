"""Lead service Pydantic schemas for API validation."""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from models import LeadStatus, LeadSource


class LeadBase(BaseModel):
    """Base lead schema with common fields."""
    
    first_name: str = Field(..., min_length=1, max_length=100, description="Lead's first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Lead's last name")
    email: EmailStr = Field(..., description="Lead's email address")
    phone: Optional[str] = Field(None, max_length=20, description="Lead's phone number")
    
    company: str = Field(..., min_length=1, max_length=200, description="Lead's company")
    title: Optional[str] = Field(None, max_length=100, description="Lead's job title")
    industry: Optional[str] = Field(None, max_length=100, description="Company industry")
    company_size: Optional[str] = Field(None, max_length=50, description="Company size")
    annual_revenue: Optional[str] = Field(None, max_length=50, description="Company annual revenue")
    
    source: LeadSource = Field(LeadSource.OTHER, description="Lead source")
    estimated_value: Optional[float] = Field(None, ge=0, description="Estimated deal value")
    expected_close_date: Optional[str] = Field(None, description="Expected close date (YYYY-MM-DD)")
    
    budget_qualified: bool = Field(False, description="Budget qualification status")
    authority_qualified: bool = Field(False, description="Authority qualification status")
    need_qualified: bool = Field(False, description="Need qualification status")
    timeline_qualified: bool = Field(False, description="Timeline qualification status")
    
    notes: Optional[str] = Field(None, description="Additional notes")
    campaign: Optional[str] = Field(None, max_length=200, description="Marketing campaign")
    utm_source: Optional[str] = Field(None, max_length=100, description="UTM source")
    utm_medium: Optional[str] = Field(None, max_length=100, description="UTM medium")
    utm_campaign: Optional[str] = Field(None, max_length=100, description="UTM campaign")
    
    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            digits = ''.join(filter(str.isdigit, v))
            if len(digits) < 7 or len(digits) > 15:
                raise ValueError('Phone number must be between 7 and 15 digits')
        return v
    
    @validator('expected_close_date')
    def validate_date_format(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v


class LeadCreate(LeadBase):
    """Schema for creating a new lead."""
    
    tenant_id: int = Field(..., description="Tenant ID for multi-tenancy")


class LeadUpdate(BaseModel):
    """Schema for updating an existing lead."""
    
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    
    company: Optional[str] = Field(None, min_length=1, max_length=200)
    title: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    company_size: Optional[str] = Field(None, max_length=50)
    annual_revenue: Optional[str] = Field(None, max_length=50)
    
    status: Optional[LeadStatus] = None
    source: Optional[LeadSource] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    estimated_value: Optional[float] = Field(None, ge=0)
    expected_close_date: Optional[str] = None
    assigned_to: Optional[int] = None
    
    budget_qualified: Optional[bool] = None
    authority_qualified: Optional[bool] = None
    need_qualified: Optional[bool] = None
    timeline_qualified: Optional[bool] = None
    
    notes: Optional[str] = None
    campaign: Optional[str] = Field(None, max_length=200)
    utm_source: Optional[str] = Field(None, max_length=100)
    utm_medium: Optional[str] = Field(None, max_length=100)
    utm_campaign: Optional[str] = Field(None, max_length=100)
    
    is_active: Optional[bool] = None


class LeadStatusUpdate(BaseModel):
    """Schema for updating lead status."""
    
    status: LeadStatus = Field(..., description="New lead status")
    notes: Optional[str] = Field(None, description="Reason for status change")


class LeadAssignment(BaseModel):
    """Schema for assigning leads."""
    
    assigned_to: int = Field(..., description="User ID to assign lead to")
    notes: Optional[str] = Field(None, description="Assignment notes")


class LeadConversion(BaseModel):
    """Schema for converting leads."""
    
    create_contact: bool = Field(True, description="Create contact record")
    create_opportunity: bool = Field(False, description="Create opportunity record")
    opportunity_name: Optional[str] = Field(None, description="Opportunity name")
    opportunity_value: Optional[float] = Field(None, ge=0, description="Opportunity value")


class LeadResponse(LeadBase):
    """Schema for lead response."""
    
    id: int
    status: str
    score: float
    priority: str
    full_name: str
    is_qualified: bool
    assigned_to: Optional[int]
    is_active: bool
    converted_to_contact_id: Optional[int]
    converted_to_opportunity_id: Optional[int]
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LeadList(BaseModel):
    """Schema for paginated lead list response."""
    
    leads: list[LeadResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool


class LeadSearchQuery(BaseModel):
    """Schema for lead search query."""
    
    query: Optional[str] = Field(None, description="Search query for name, email, or company")
    status: Optional[LeadStatus] = Field(None, description="Filter by status")
    source: Optional[LeadSource] = Field(None, description="Filter by source")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$", description="Filter by priority")
    assigned_to: Optional[int] = Field(None, description="Filter by assigned user")
    is_qualified: Optional[bool] = Field(None, description="Filter by qualification status")
    company: Optional[str] = Field(None, description="Filter by company")
    industry: Optional[str] = Field(None, description="Filter by industry")
    min_score: Optional[float] = Field(None, ge=0, le=100, description="Minimum lead score")
    max_score: Optional[float] = Field(None, ge=0, le=100, description="Maximum lead score")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Page size")
    sort_by: str = Field("created_at", description="Sort field")
    sort_order: str = Field("desc", pattern="^(asc|desc)$", description="Sort order")


class LeadScoreBreakdown(BaseModel):
    """Schema for lead score breakdown."""
    
    total_score: float
    company_size_score: float
    source_score: float
    qualification_score: float
    title_score: float
    score_factors: dict