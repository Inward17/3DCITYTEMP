from typing import Optional

from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(SQLModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    is_active: bool = Field(default=True)


class UserResponse(UserBase):
    id: int
    is_active: bool
