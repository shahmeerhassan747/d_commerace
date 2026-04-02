from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    name: str
    user_name: str
    password: str
    image: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(BaseModel):
    id: int
    name: str
    user_name: str
    image: Optional[str] = None


    class Config:
        from_attributes = True
