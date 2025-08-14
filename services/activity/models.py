"""Activity service database models."""

from sqlalchemy import String, Text, Integer, DateTime, Enum as SqlEnum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from shared.database import Base
from typing import Optional
from datetime import datetime
import enum


class ActivityType(str, enum.Enum):
    """Activity type enumeration."""
    CALL = "call"
    EMAIL = "email"
    MEETING = "meeting"
    TASK = "task"
    NOTE = "note"
    DEMO = "demo"
    PRESENTATION = "presentation"
    FOLLOW_UP = "follow_up"
    PROPOSAL_SENT = "proposal_sent"
    CONTRACT_SENT = "contract_sent"


class ActivityStatus(str, enum.Enum):
    """Activity status enumeration."""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"


class ActivityPriority(str, enum.Enum):
    """Activity priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Activity(Base):
    """Activity model representing tasks, communications, and interactions."""
    
    __tablename__ = "activities"
    
    # Basic Information
    subject: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Classification
    activity_type: Mapped[ActivityType] = mapped_column(
        SqlEnum(ActivityType), 
        nullable=False, 
        index=True
    )
    status: Mapped[ActivityStatus] = mapped_column(
        SqlEnum(ActivityStatus), 
        default=ActivityStatus.PLANNED, 
        nullable=False, 
        index=True
    )
    priority: Mapped[ActivityPriority] = mapped_column(
        SqlEnum(ActivityPriority), 
        default=ActivityPriority.MEDIUM, 
        nullable=False, 
        index=True
    )
    
    # Timing
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True)
    completed_date: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True)
    
    # Duration (in minutes)
    estimated_duration: Mapped[Optional[int]] = mapped_column(Integer)
    actual_duration: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Relationships
    contact_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    opportunity_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    lead_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    
    # Assignment and Ownership
    owner_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    assigned_to: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    
    # Communication Details (for calls, emails, meetings)
    location: Mapped[Optional[str]] = mapped_column(String(200))  # For meetings
    meeting_url: Mapped[Optional[str]] = mapped_column(String(500))  # For virtual meetings
    call_result: Mapped[Optional[str]] = mapped_column(String(100))  # For calls: connected, no_answer, busy, etc.
    email_subject: Mapped[Optional[str]] = mapped_column(String(200))  # For emails
    
    # Follow-up and Reminders
    has_reminder: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_date: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True)
    reminder_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Outcome and Results
    outcome: Mapped[Optional[str]] = mapped_column(String(500))
    next_action: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Additional Information
    notes: Mapped[Optional[str]] = mapped_column(Text)
    tags: Mapped[Optional[str]] = mapped_column(String(500))  # Comma-separated tags
    
    # Status tracking
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    
    # Tenant isolation
    tenant_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    @property
    def is_overdue(self) -> bool:
        """Check if activity is overdue."""
        if not self.due_date or self.status == ActivityStatus.COMPLETED:
            return False
        return datetime.utcnow() > self.due_date
    
    @property
    def is_due_today(self) -> bool:
        """Check if activity is due today."""
        if not self.due_date:
            return False
        today = datetime.utcnow().date()
        return self.due_date.date() == today
    
    @property
    def is_due_this_week(self) -> bool:
        """Check if activity is due this week."""
        if not self.due_date:
            return False
        today = datetime.utcnow().date()
        days_until_due = (self.due_date.date() - today).days
        return 0 <= days_until_due <= 7
    
    @property
    def related_entity_type(self) -> str:
        """Get the type of related entity."""
        if self.contact_id:
            return "contact"
        elif self.opportunity_id:
            return "opportunity"
        elif self.lead_id:
            return "lead"
        return "none"
    
    @property
    def related_entity_id(self) -> Optional[int]:
        """Get the ID of the related entity."""
        if self.contact_id:
            return self.contact_id
        elif self.opportunity_id:
            return self.opportunity_id
        elif self.lead_id:
            return self.lead_id
        return None
    
    def complete_activity(self, outcome: Optional[str] = None, next_action: Optional[str] = None):
        """Mark activity as completed."""
        self.status = ActivityStatus.COMPLETED
        self.completed_date = datetime.utcnow()
        if outcome:
            self.outcome = outcome
        if next_action:
            self.next_action = next_action
    
    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "subject": self.subject,
            "description": self.description,
            "activity_type": self.activity_type.value,
            "status": self.status.value,
            "priority": self.priority.value,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "completed_date": self.completed_date.isoformat() if self.completed_date else None,
            "estimated_duration": self.estimated_duration,
            "actual_duration": self.actual_duration,
            "contact_id": self.contact_id,
            "opportunity_id": self.opportunity_id,
            "lead_id": self.lead_id,
            "owner_id": self.owner_id,
            "assigned_to": self.assigned_to,
            "location": self.location,
            "meeting_url": self.meeting_url,
            "call_result": self.call_result,
            "email_subject": self.email_subject,
            "has_reminder": self.has_reminder,
            "reminder_date": self.reminder_date.isoformat() if self.reminder_date else None,
            "reminder_sent": self.reminder_sent,
            "outcome": self.outcome,
            "next_action": self.next_action,
            "notes": self.notes,
            "tags": self.tags.split(",") if self.tags else [],
            "is_active": self.is_active,
            "is_overdue": self.is_overdue,
            "is_due_today": self.is_due_today,
            "is_due_this_week": self.is_due_this_week,
            "related_entity_type": self.related_entity_type,
            "related_entity_id": self.related_entity_id,
            "tenant_id": self.tenant_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }