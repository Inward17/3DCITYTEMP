from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel
from pydantic import EmailStr

class UserBase(SQLModel):
    """Base User model with shared fields"""
    email: EmailStr = Field(unique=True, index=True)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

class User(UserBase, table=True):
    """User database model"""
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)

class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(min_length=8)

class UserLogin(SQLModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class UserResponse(UserBase):
    """Schema for user response (excludes password)"""
    id: int
    created_at: datetime

class Token(SQLModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"

class TokenData(SQLModel):
    """Token payload data"""
    email: Optional[str] = None