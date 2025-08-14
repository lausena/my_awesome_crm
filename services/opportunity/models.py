"""Opportunity service database models."""

from sqlalchemy import String, Text, Integer, Float, Enum as SqlEnum, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column
from shared.database import Base
from typing import Optional
from datetime import date
import enum


class OpportunityStage(str, enum.Enum):
    """Opportunity stage enumeration."""
    PROSPECTING = "prospecting"
    QUALIFICATION = "qualification"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"


class OpportunityType(str, enum.Enum):
    """Opportunity type enumeration."""
    NEW_BUSINESS = "new_business"
    EXISTING_BUSINESS = "existing_business"
    RENEWAL = "renewal"
    UPSELL = "upsell"
    CROSS_SELL = "cross_sell"


class Opportunity(Base):
    """Opportunity model representing sales deals."""
    
    __tablename__ = "opportunities"
    
    # Basic Information
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Financial Information
    value: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    probability: Mapped[float] = mapped_column(Float, default=0.0, index=True)  # 0.0 to 1.0
    expected_revenue: Mapped[Optional[float]] = mapped_column(Float)  # value * probability
    
    # Stage and Type
    stage: Mapped[OpportunityStage] = mapped_column(
        SqlEnum(OpportunityStage), 
        default=OpportunityStage.PROSPECTING, 
        nullable=False, 
        index=True
    )
    opportunity_type: Mapped[OpportunityType] = mapped_column(
        SqlEnum(OpportunityType), 
        default=OpportunityType.NEW_BUSINESS, 
        nullable=False, 
        index=True
    )
    
    # Dates
    expected_close_date: Mapped[Optional[date]] = mapped_column(Date, index=True)
    actual_close_date: Mapped[Optional[date]] = mapped_column(Date, index=True)
    
    # Relationships
    contact_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    account_company: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    
    # Assignment and Ownership
    owner_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)  # Sales rep
    assigned_to: Mapped[Optional[int]] = mapped_column(Integer, index=True)  # Can be different from owner
    
    # Sales Process
    lead_source: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    competitor: Mapped[Optional[str]] = mapped_column(String(200))
    next_step: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Classification
    priority: Mapped[str] = mapped_column(String(20), default="medium", index=True)  # low, medium, high
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    
    # Loss Reason (if closed lost)
    loss_reason: Mapped[Optional[str]] = mapped_column(String(200))
    
    # Campaign and Marketing
    campaign: Mapped[Optional[str]] = mapped_column(String(200), index=True)
    
    # Additional Information
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Tenant isolation
    tenant_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    def update_expected_revenue(self):
        """Update expected revenue based on value and probability."""
        if self.value and self.probability is not None:
            self.expected_revenue = self.value * self.probability
    
    def update_stage_probability(self):
        """Update probability based on stage."""
        stage_probabilities = {
            OpportunityStage.PROSPECTING: 0.10,
            OpportunityStage.QUALIFICATION: 0.25,
            OpportunityStage.PROPOSAL: 0.50,
            OpportunityStage.NEGOTIATION: 0.75,
            OpportunityStage.CLOSED_WON: 1.0,
            OpportunityStage.CLOSED_LOST: 0.0
        }
        self.probability = stage_probabilities.get(self.stage, 0.0)
        self.update_expected_revenue()
    
    @property
    def is_won(self) -> bool:
        """Check if opportunity is won."""
        return self.stage == OpportunityStage.CLOSED_WON
    
    @property
    def is_lost(self) -> bool:
        """Check if opportunity is lost."""
        return self.stage == OpportunityStage.CLOSED_LOST
    
    @property
    def is_closed(self) -> bool:
        """Check if opportunity is closed (won or lost)."""
        return self.is_won or self.is_lost
    
    @property
    def is_open(self) -> bool:
        """Check if opportunity is still open."""
        return not self.is_closed and self.is_active
    
    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "value": self.value,
            "probability": self.probability,
            "expected_revenue": self.expected_revenue,
            "stage": self.stage.value,
            "opportunity_type": self.opportunity_type.value,
            "expected_close_date": self.expected_close_date.isoformat() if self.expected_close_date else None,
            "actual_close_date": self.actual_close_date.isoformat() if self.actual_close_date else None,
            "contact_id": self.contact_id,
            "account_company": self.account_company,
            "owner_id": self.owner_id,
            "assigned_to": self.assigned_to,
            "lead_source": self.lead_source,
            "competitor": self.competitor,
            "next_step": self.next_step,
            "priority": self.priority,
            "is_active": self.is_active,
            "is_won": self.is_won,
            "is_lost": self.is_lost,
            "is_closed": self.is_closed,
            "is_open": self.is_open,
            "loss_reason": self.loss_reason,
            "campaign": self.campaign,
            "notes": self.notes,
            "tenant_id": self.tenant_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }