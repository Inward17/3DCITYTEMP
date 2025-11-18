from typing import Optional
from datetime import datetime
from beanie import Document
from pydantic import BaseModel, Field

class Road(Document):
    """Road/Connection document model"""
    project_id: str = Field(..., index=True)
    from_location: str  # Location ID
    to_location: str    # Location ID
    distance: float
    type: str = "primary"  # road type: 'primary', 'secondary', 'highway'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "roads"
        indexes = [
            "project_id",
            "from_location",
            "to_location",
        ]

class RoadCreate(BaseModel):
    """Schema for creating a road"""
    from_location: str
    to_location: str
    distance: float
    type: str = "primary"

class RoadUpdate(BaseModel):
    """Schema for updating a road"""
    distance: Optional[float] = None
    type: Optional[str] = None

class RoadResponse(BaseModel):
    """Schema for road response"""
    id: str
    project_id: str
    from_location: str
    to_location: str
    distance: float
    type: str
    created_at: datetime
    
    class Config:
        from_attributes = True