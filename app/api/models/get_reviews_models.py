from pydantic import BaseModel
from typing import Optional

class ReviewResponse(BaseModel):
    id: int
    rating: Optional[float] = None
    review: Optional[str] = None
    user_name: Optional[str] = None
    product_name: Optional[str] = None
    user_id: Optional[int] = None
    product_id: Optional[int] = None

    class Config:
        from_attributes = True
