from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, JSON, Column
from enum import Enum

class ModelType(str, Enum):
    """Project model types"""
    PLANNING = "planning"
    CORPORATE = "corporate"

class ProjectBase(SQLModel):
    """Base Project model"""
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="")
    model_type: ModelType = Field(default=ModelType.PLANNING)
    sectors: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    theme: Optional[str] = Field(default=None)

class Project(ProjectBase, table=True):
    """Project database model"""
    __tablename__ = "projects"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)

class ProjectCreate(ProjectBase):
    """Schema for creating a project"""
    pass

class ProjectUpdate(SQLModel):
    """Schema for updating a project"""
    name: Optional[str] = None
    description: Optional[str] = None
    sectors: Optional[List[str]] = None
    theme: Optional[str] = None

class ProjectResponse(ProjectBase):
    """Schema for project response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None