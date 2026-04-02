from pydantic import BaseModel
from typing import Optional

class ReviewUpdate(BaseModel):
    rating: Optional[float] = None
    review: Optional[str] = None
    user_id: Optional[int] = None
    product_id: Optional[int] = None

class ReviewResponse(BaseModel):
    id: int
    rating: float
    review: Optional[str] = None
    user_id: int
    product_id: int

    class Config:
        from_attributes = True
