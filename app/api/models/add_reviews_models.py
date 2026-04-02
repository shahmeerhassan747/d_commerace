from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    rating: float
    review: Optional[str] = None
    user_id: int
    product_id: int

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int

    class Config:
        from_attributes = True
