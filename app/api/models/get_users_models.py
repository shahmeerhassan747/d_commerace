from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    id: int
    name: str
    user_name: str
    cart_items: int
    wishlist_items: int
    total_reviews: int
    image: Optional[str] = None

    class Config:
        from_attributes = True
