from typing import Optional
from datetime import datetime
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field

class User(Document):
    """User database model"""
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
        ]

class UserCreate(BaseModel):
    """Schema for creating a new user"""
    email: EmailStr
    password: str = Field(min_length=8)
    is_active: bool = True
    is_superuser: bool = False

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Schema for user response (excludes password)"""
    id: str
    email: EmailStr
    is_active: bool
    is_superuser: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Token payload data"""
    email: Optional[str] = None