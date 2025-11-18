from typing import Optional, List
from datetime import datetime
from beanie import Document
from pydantic import BaseModel, Field

class LocationPosition(BaseModel):
    """3D Position coordinates"""
    x: float
    y: float
    z: float
    
    @classmethod
    def from_tuple(cls, position: tuple):
        """Create from tuple [x, y, z]"""
        return cls(x=position[0], y=position[1], z=position[2])
    
    def to_tuple(self) -> List[float]:
        """Convert to tuple format"""
        return [self.x, self.y, self.z]

class Location(Document):
    """Location/Building document model"""
    project_id: str = Field(..., index=True)
    name: str
    type: str  # e.g., 'residential', 'commercial', 'industrial'
    position: LocationPosition
    description: Optional[str] = None
    color: Optional[str] = "#60a5fa"
    zone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "locations"
        indexes = [
            "project_id",
        ]

class LocationCreate(BaseModel):
    """Schema for creating a location"""
    name: str
    type: str
    position: List[float] = Field(..., min_length=3, max_length=3)
    description: Optional[str] = None
    color: Optional[str] = "#60a5fa"
    zone: Optional[str] = None

class LocationUpdate(BaseModel):
    """Schema for updating a location"""
    name: Optional[str] = None
    type: Optional[str] = None
    position: Optional[List[float]] = Field(None, min_length=3, max_length=3)
    description: Optional[str] = None
    color: Optional[str] = None
    zone: Optional[str] = None

class LocationResponse(BaseModel):
    """Schema for location response"""
    id: str
    project_id: str
    name: str
    type: str
    position: List[float]
    description: Optional[str] = None
    color: Optional[str] = None
    zone: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True