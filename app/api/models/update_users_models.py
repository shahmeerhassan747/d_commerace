from pydantic import BaseModel
from typing import Optional

class UserUpdate(BaseModel):
    name: Optional[str] = None
    user_name: Optional[str] = None
    password: Optional[str] = None
    image: Optional[str] = None

class UserUpdateResponse(BaseModel):
    id: int
    name: str
    user_name: str
    image: Optional[str] = None

    class Config:
        from_attributes = True
